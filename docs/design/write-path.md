# Write Path

How client mutations reach the server, and a deferred design proposal for
scaling that path. Section (a) documents what exists today
(`utils/plannerUtils/apiClient.ts`); section (b) is a **design-only** proposal
that is **not implemented**.

## (a) writechain-1 — the single FIFO write chain (implemented)

### What it is

All mutations flow through one module-level FIFO promise chain in
`utils/plannerUtils/apiClient.ts`:

```ts
let writeChain: Promise<unknown> = Promise.resolve()

export function sendMutation(dispatch, request, boardId?) {
  writeChain = writeChain.then(request).catch(/* recovery */)
}
```

Every call appends `request` to `writeChain` via `.then`, so requests are sent
to the server strictly in the order `sendMutation` was called. The UI has
already updated optimistically (the reducer applied the change) before the
request is enqueued; the chain governs only the order in which those changes are
_persisted_.

Keystroke-driven saves (card title/content) go through `sendDebouncedMutation`,
a per-key trailing debounce that ultimately calls `sendMutation` when it fires,
so debounced saves join the same single chain. `flushDebouncedMutation` forces a
key's pending save to fire immediately (used on dialog close so a final
keystroke isn't dropped) — it too lands on the one chain.

### Why it exists

The planner state is order-sensitive: card position within a column, column
order, board order. Without serialization, two quick mutations can race. The
canonical example the chain prevents: a user drags a card, then immediately
drags it again before the first request completes. If both requests were
in-flight concurrently, the server could apply them out of order and the _first_
(now stale) order could land last, resurrecting a position the user already moved
away from. The optimistic UI would then disagree with the server. FIFO
serialization guarantees the server applies writes in the same order the user
made them, so the persisted state converges to what the UI shows.

### Failure handling

Because the UI is optimistic, a failed request means the store has diverged from
the server and must re-hydrate. On the first failure in the chain:

1. Log the error and show a single toast: "Your last change couldn't be saved.
   Restoring your planner from the server."
2. Append a recovery step to the same chain so it runs _after_ the queue drains
   (in-flight writes finish first).
3. Recovery re-hydrates from the server:
   - **Scoped (mutation-1):** if the failed mutation passed a `boardId`, only
     that board's slice is re-fetched via `fetchBoard` and merged with
     `boardDataLoaded`. An error in one board can't blow away other boards'
     pending edits or force a whole-document round-trip.
   - **Whole-doc fallback:** board-level ops (create/delete/reorder boards) pass
     no `boardId` and re-hydrate the entire document via `fetchPlannerData` +
     `dataFetchedFromDatabase`.

A `refetchScheduled` flag debounces recovery: the first failure to schedule
recovery wins, and its `boardId` (or whole-doc fallback) is what runs; further
failures queued behind it collapse into that one recovery, so a burst of
failures yields one toast and one refetch.

### Trade-off

One chain means **one slow (or hung) request blocks all subsequent writes**,
including writes to unrelated boards. There is no head-of-line-blocking
isolation: a slow PATCH on board A delays a card toggle on board B until A's
request resolves. At current scale this is acceptable (see below), but it is the
known cost of the simplest correct design and the motivation for the sharding
proposal.

## (b) shard-1 — per-board write-chain sharding (DESIGN ONLY, not implemented)

> **Status: design only. No code for this exists.** This section describes a
> future option, not current behavior.

### Proposal

Replace the single module-level `writeChain` with one FIFO chain _per board_,
keyed by `boardId`:

```ts
// DESIGN SKETCH — not in the codebase
const writeChains = new Map<string, Promise<unknown>>()

function chainFor(key: string): Promise<unknown> {
  return writeChains.get(key) ?? Promise.resolve()
}
```

`sendMutation(dispatch, request, boardId)` would append to the chain for its
`boardId` instead of the global one. Writes to different boards then run
concurrently; writes to the _same_ board stay strictly ordered, preserving the
ordering guarantee that motivates writechain-1 in the first place (per-board
order is the only order that matters for per-board state).

### Keying

- **Per-board ops** (cards, columns, subtasks, categories within a board): key
  on `boardId` — the same `boardId` already threaded through `sendMutation` for
  scoped recovery, so the keying parameter is already present at every call site.
- **Board-level ops** (create/delete/reorder boards, which mutate `boardOrder`
  and the board set): these have no single owning board and must remain globally
  serialized. They would use a reserved key (e.g. a `GLOBAL` sentinel) so they
  don't interleave with each other, with a documented rule that board-level ops
  and per-board ops don't have a cross-ordering requirement that a shared key
  would need to enforce.

### Benefits

- **No cross-board head-of-line blocking.** A slow request on board A no longer
  delays writes to board B — the chief drawback of the single chain.
- **Failure isolation.** A failure on board A schedules recovery only on board
  A's chain (and mutation-1 already scopes the _refetch_ to board A). Board B's
  chain keeps draining its writes uninterrupted, and B's toast/recovery state is
  independent of A's.

### Why it's deferred

Sharding adds real complexity that current usage doesn't justify:

- **Scale.** The app is effectively single-user-per-board: one person edits one
  board at a time. Concurrent writes to _different_ boards from the same client
  in the same instant are rare-to-nonexistent, so the head-of-line-blocking the
  single chain can cause is largely theoretical in practice.
- **New edge cases.** Per-board chains need lifecycle management (creating chains
  lazily, the board-level `GLOBAL` key, and deciding when an idle chain entry can
  be dropped from the Map to avoid an unbounded `Map`), plus a clear rule for
  ordering between board-level ops and per-board ops. The single chain has none
  of this.
- **Recovery already scoped.** mutation-1 already makes _failure recovery_
  board-scoped, which captured most of the practical isolation win without
  touching the ordering mechanism. Sharding would mainly add _concurrency_
  isolation, which isn't a felt problem yet.

Revisit sharding if usage shifts to genuine multi-board concurrent editing
(e.g. multiple boards open in different tabs writing simultaneously, or a
collaborative/multi-user model) where one board's slow request measurably
stalls another's writes.
