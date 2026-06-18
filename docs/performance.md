# Performance Architecture

How the client renders and persists planner state, and the optimizations
delivered in the hardening pass. Each section states the change, _why_ it
exists, and the expected impact. It is accurate to the code as of this branch;
file paths are given so claims can be checked against source.

## Summary

The board UI is read-heavy and mutation-heavy: a user drags cards, edits titles
on every keystroke, and toggles subtasks, all of which mutate a single
normalized planner tree (`boards / columns / categories / taskCards /
subTasks`). The original design re-rendered every consumer on every mutation and
fetched the entire planner document up front. The pass below replaces the
state-distribution mechanism, narrows what each component subscribes to,
memoizes the expensive derivations and pure leaves, defers the heavy edit
dialog, and makes data loading and failure recovery board-scoped.

| Change          | What                                                         | Expected impact                                                                        |
| --------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| perf-2          | External store + `usePlannerSelector` granular subscriptions | A mutation re-renders only components whose selected slice changed, not every consumer |
| perf-3          | Memoized `ColumnTasks` filter/search derivation              | Visible-card list recomputes only when an input changes, not every render              |
| perf-4 / perf-8 | `React.memo` on pure board leaves                            | Leaves skip re-render when their props/slices are unchanged                            |
| perf-5          | `TaskCardDialog` code-split via `next/dynamic`               | Heavy edit-dialog chunk leaves the initial board bundle; loads on first open           |
| refactor-2      | Lazy per-board data load                                     | First paint ships a light summary; each board's heavy slice loads on open              |
| mutation-1      | Board-scoped failure refetch                                 | A failed write in one board re-hydrates only that board                                |
| perf-6          | (Not implemented) row virtualization for very large columns  | Reserved as future work; see note below                                                |

## perf-2 — external store with granular subscriptions

**Before.** Planner DATA state was a `useReducer` whose value was distributed
through React context. Every component that called `usePlanner()` consumed that
context, so _any_ dispatch re-rendered _every_ consumer, regardless of whether
the part of the tree it cared about had changed. With dozens of cards on a
board, a single keystroke or drag fanned out into a full-board render.

**After.** DATA state moved into a minimal external store
(`hooks/Planner/store.ts`): a closed-over `state`, a `Set` of listeners, and
`getState / dispatch / subscribe`. The store is created once per provider via
`useRef` (`hooks/Planner/Planner.tsx`), so its three methods are stable
identities for the provider's lifetime. The underlying immer `plannerReducer` is
unchanged — only the distribution mechanism changed.

Consumers now read a _slice_ through `usePlannerSelector`
(`hooks/Planner/Planner.tsx`), which wraps `useSyncExternalStoreWithSelector`
from `use-sync-external-store/with-selector`. A component re-renders only when
its selected value changes under the equality check (default `Object.is` /
referential). Because the reducer is immer-based, slices that a mutation does
not touch keep the same reference, so the default referential check is both
correct and minimal — no manual memo of selector outputs required for
single-slice reads.

Two store-level guards keep this tight:

- **No-op dispatches don't notify.** immer returns the same root reference when
  a reducer makes no change; `dispatch` compares `next === state` and returns
  early, so a write that changes nothing triggers zero renders.
- **Listener set is snapshotted before notifying** (`Array.from(listeners)`), so
  a listener that subscribes/unsubscribes during notification can't corrupt the
  iteration.

**Anti-footgun.** A selector that builds a _new_ object/array each call
(`s => ({ a: s.a, b: s.b })`) is never referentially equal to its prior result,
so it re-renders on every dispatch and can loop. The documented convention
(`hooks/Planner/Planner.tsx`) is one selector per primitive slice, or pass a
shallow `isEqual` for combined values. `usePlanner()` still exists as a
back-compat whole-state selector for un-migrated consumers; it behaves exactly
like the old context (re-renders on any change) and is the thing hot paths
migrate away from.

**Expected impact.** Mutation cost goes from O(consumers) renders to
O(consumers-whose-slice-changed). Editing card A's title re-renders A's title
view, not card B, not the column header, not sibling columns.

**Automated guard.** `hooks/Planner/usePlannerSelector.test.tsx` is the
regression test for this win. It mounts two components each subscribed to a
different card, dispatches a title change to one, and asserts exact render
counts: the changed card re-renders (count 1 → 2) and the _other_ does not
(stays at 1). A second case asserts a no-op dispatch (same title) produces zero
extra renders. These exact counts also prove there is no render loop.

## perf-3 — memoized filter/search derivation in ColumnTasks

`components/planner/Board/TaskColumns/ColumnTasks.tsx` derives the visible card
list by filtering the column's card order against the board's category set, the
search query, and the selected-category filter. Previously this ran on every
render. It is now wrapped in `useMemo` keyed on its real inputs
(`columnInfo.taskCards`, `categoriesInBoard`, `taskCards`, `searchQuery`,
`selectedCategories`), so it recomputes only when one of those changes. A stable
output identity across no-op renders also keeps the downstream `.map` from
rebuilding `TaskCard` rows.

`ColumnTasks` itself is `React.memo`-wrapped and subscribes per slice
(its own column entry, the board's categories, and the cards map), so an
unrelated column's mutation doesn't re-run this work at all.

## perf-4 / perf-8 — React.memo on pure board leaves

The pure presentational leaves of the board tree are wrapped in `React.memo` so
they skip re-render when their props and selected slices are unchanged:

- `ColumnHeader` (`components/planner/Board/TaskColumns/ColumnHeader.tsx`)
- `CategoryBadge` (`.../TaskCard/CategoryBadge.tsx`)
- `ProgressBar` (`.../TaskCard/ProgressBar.tsx`)
- `SubTasks` (`.../TaskCard/SubTasks.tsx`)
- `AddNewCardButton` (`.../AddNewCardButton.tsx`)
- `ColumnEmptyState` (`.../ColumnEmptyState.tsx`)

Each takes only primitive/ID props (e.g. `ColumnHeader` takes `columnId` plus
the drag-handle props) and reads its own slice, so the memo comparison is cheap
and props identities are stable across parent re-renders. `memo` here is only
correct because the callbacks reaching these leaves are stable — that was
verified as part of the change. `ColumnHeader`'s memo behavior is covered by
`components/planner/Board/TaskColumns/ColumnHeader.test.tsx`.

**Expected impact.** When a parent re-renders for an unrelated reason, these
leaves bail out instead of reconciling their subtrees.

## perf-5 — code-split TaskCardDialog

The edit dialog and its subtree (`EditableSubTasks`, textareas) are heavy and
needed only after a card is opened. `components/.../TaskCard/TaskCard.tsx`
imports it via `next/dynamic` with `ssr: false`, so its chunk leaves the initial
board bundle and is fetched on first open rather than shipping with every board
load.

The dialog is mounted behind a `hasOpened` latch: the `Dialog` is controlled,
`hasOpened` flips to `true` the first time the card opens and never resets, so
the dynamic `TaskCardDialog` enters the React tree (and its chunk is fetched)
exactly once, on first open, and re-opens reuse the loaded chunk. Once mounted,
Radix's own controlled open/close drives `DialogContent` mount/unmount, which
**preserves the close animation** and **preserves flush-on-close**: closing the
dialog unmounts the content, and its cleanup effect
(`.../TaskCardDialog/TaskCardDialog.tsx`) calls `flushDebouncedMutation` for the
card's title and content keys, so the last keystroke isn't lost to a debounce
timer that never got to fire.

**Expected impact.** Smaller initial board bundle / faster first board paint;
the dialog cost is paid lazily and only by users who actually open a card.

## refactor-2 — lazy per-board data load

**Before.** Mount fetched the entire planner document (`fetchPlannerData`,
`GET /api/planner`) — every board's columns, cards, and subtasks — before the
first board could render.

**After.** Mount fetches only a light summary (`fetchPlannerSummary`,
`GET /api/planner/summary`: `boardOrder`, `boards`, `categories`) in
`PlannerProvider`. Each board's heavy slice is fetched on demand by
`useEnsureBoardLoaded(boardId)` (`hooks/Planner/Planner.tsx`), which calls
`fetchBoard` (`GET /api/planner/boards/:id`) the first time a board is opened and
merges it via the `boardDataLoaded` action, marking the board loaded in ephemeral
state. The fetch is:

- **Idempotent** — a board already in `loadedBoardIds` skips the request.
- **Abort-safe** — the request aborts on unmount / `boardId` change, so a stale
  board's slice can't land over a newer one (StrictMode double-mount and quick
  navigation safe).
- **404-safe** — the fetch only fires for boards present in the summary;
  non-existent boards route to `notFound()` and never trigger it.

**Expected impact.** First paint payload and parse cost scale with the number of
boards (metadata) instead of the total size of all boards' contents. Opening a
board pays only that board's cost.

## mutation-1 — board-scoped failure recovery

When an optimistic mutation fails, the store has diverged from the server and
must re-hydrate. `sendMutation` (`utils/plannerUtils/apiClient.ts`) takes an
optional `boardId`: when present, recovery re-hydrates _only_ that board's slice
via `fetchBoard` + `boardDataLoaded`, so an error in one board can't blow away
other boards' still-pending edits or force a whole-document round-trip.
Board-level operations (create/delete/reorder boards) pass no `boardId` and fall
back to the whole-doc re-hydrate (`fetchPlannerData` + `dataFetchedFromDatabase`)
as before. See `docs/design/write-path.md` for the full write-path model.

## perf-6 — column virtualization (not implemented)

Row virtualization for very large columns is **not present in the codebase**.
There is no virtualization/windowing library or flag in the source today.
It is recorded here as recognized future work: behind a default-off flag, only
very large columns (hundreds of cards) would windowing pay off, and the current
single-user-per-board scale does not reach that. Revisit if real columns grow
large enough that even the memoized, granularly-subscribed card list costs
measurable layout/paint time.

## Measurement approach

These are render-count and bundle-shape optimizations, so they're measured the
same way:

- **React DevTools Profiler / render counts.** Record a commit while performing a
  representative action (edit one card title, drag one card, toggle one subtask)
  and confirm only the intended components show up in the commit — siblings and
  unrelated columns should be absent (perf-2/3/4/8). The "Highlight updates"
  overlay is the quick visual check; the Profiler flamegraph is the precise one.
- **Automated regression guard.** `hooks/Planner/usePlannerSelector.test.tsx`
  pins the perf-2 contract in CI with _exact_ render counts (changed slice
  re-renders, untouched slice does not, no-op dispatch renders zero times). This
  is the durable guard — Profiler sessions are manual and easy to skip; the test
  fails loudly if a future change re-broadens subscriptions or reintroduces a
  render loop.
- **Bundle analysis.** `npm run analyze` (`ANALYZE=true next build`, wired via
  `@next/bundle-analyzer` in `next.config.js`) renders the treemap to verify the
  `TaskCardDialog` chunk is split out of the initial board bundle (perf-5) and to
  watch overall bundle size. Without `ANALYZE`, the build is byte-identical to a
  normal build — the analyzer wrapper is a no-op.
- **Network.** The DevTools Network panel confirms refactor-2: mount requests
  `/api/planner/summary` (small), and opening a board requests
  `/api/planner/boards/:id` once.
