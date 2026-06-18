import axios from 'axios'
import { toast } from 'sonner'

import { DEBOUNCE_TIME_MS } from '@/constants/constants'
import { BoardDataType, PlannerDispatchContextType, PlannerSummaryType, PlannerType } from '@/hooks/Planner/types'

/*
 * Minimal trailing-edge debounce, replacing lodash/debounce. Each call resets
 * the timer; when it fires, the wrapped fn runs once with the LATEST args. This
 * matches lodash's default { leading: false, trailing: true } semantics, which
 * is all the per-key debouncedSenders Map relied on.
 *
 * .flush() forces a pending trailing call to run immediately with the latest
 * args (clearing the timer first so it can't double-fire), and is a no-op when
 * nothing is pending. Used to drain in-flight keystroke saves before the editor
 * unmounts, so the last edit isn't lost to a timer that never gets to fire.
 */
type DebouncedFn<A extends unknown[]> = ((...args: A) => void) & { flush: () => void }

function debounce<A extends unknown[]>(fn: (...args: A) => void, waitMs: number): DebouncedFn<A> {
  let timer: ReturnType<typeof setTimeout> | undefined
  let latestArgs: A
  const debounced = (...args: A) => {
    latestArgs = args
    if (timer !== undefined) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      timer = undefined
      fn(...latestArgs)
    }, waitMs)
  }
  debounced.flush = () => {
    if (timer === undefined) {
      return
    }
    clearTimeout(timer)
    timer = undefined
    fn(...latestArgs)
  }
  return debounced
}

export const emptyPlannerData: PlannerType = {
  boardOrder: [],
  boards: {},
  columns: {},
  categories: {},
  taskCards: {},
  subTasks: {},
}

export async function fetchPlannerData(signal?: AbortSignal): Promise<PlannerType> {
  const { data } = await axios.get('/api/planner', { signal })
  return {
    boardOrder: data.boardOrder,
    boards: data.boards,
    columns: data.columns,
    categories: data.categories,
    taskCards: data.taskCards,
    subTasks: data.subTasks,
  }
}

/*
 * The light first-load fetch: board metadata only (boardOrder/boards/
 * categories). Each board's heavy slice is fetched lazily on open via
 * fetchBoard. Replaces the whole-doc fetchPlannerData on mount.
 */
export async function fetchPlannerSummary(signal?: AbortSignal): Promise<PlannerSummaryType> {
  const { data } = await axios.get('/api/planner/summary', { signal })
  return {
    boardOrder: data.boardOrder,
    boards: data.boards,
    categories: data.categories,
  }
}

/*
 * One board's heavy slice (columns/cards/subtasks + that board's categories),
 * fetched when the board is opened and merged into the store via boardDataLoaded.
 * Also the scoped recovery path for a failed in-board mutation (see sendMutation).
 */
export async function fetchBoard(boardId: string, signal?: AbortSignal): Promise<BoardDataType> {
  const { data } = await axios.get(`/api/planner/boards/${boardId}`, { signal })
  return {
    board: data.board,
    columns: data.columns,
    categories: data.categories,
    taskCards: data.taskCards,
    subTasks: data.subTasks,
  }
}

/*
 * Every mutation flows through one FIFO chain, so writes reach the server in
 * dispatch order — a fast second drag can no longer overtake the first one's
 * in-flight request and resurrect stale order.
 *
 * The UI updates optimistically before the request is sent. If a request
 * fails, the store has diverged from the server, so recovery re-hydrates from
 * the server once the queue drains, after a single error toast.
 *
 * SCOPE (mutation-1): when the failed mutation names the board it operated on
 * (boardId), recovery re-hydrates ONLY that board's slice via fetchBoard +
 * boardDataLoaded, so an error in one board can't blow away other boards'
 * unsaved-but-still-pending edits or force a whole-doc round-trip. Board-level
 * ops (create/delete/reorder boards) pass no boardId and fall back to the
 * whole-doc re-hydrate (fetchPlannerData + dataFetchedFromDatabase) as before.
 *
 * The single-toast / single-refetch debounce is unchanged: the first failure
 * to schedule recovery wins and its boardId (or whole-doc fallback) is what
 * runs; further failures queued behind it collapse into that one recovery.
 */
let writeChain: Promise<unknown> = Promise.resolve()
let refetchScheduled = false

export function sendMutation(
  dispatch: PlannerDispatchContextType,
  request: () => Promise<unknown>,
  boardId?: string
): void {
  writeChain = writeChain.then(request).catch((error) => {
    console.error('Mutation failed:', error)
    if (refetchScheduled) {
      return
    }
    refetchScheduled = true
    toast.error("Your last change couldn't be saved. Restoring your planner from the server.")
    writeChain = writeChain.then(async () => {
      refetchScheduled = false
      try {
        if (boardId !== undefined) {
          // Scoped recovery: re-hydrate only the affected board.
          const data = await fetchBoard(boardId)
          dispatch({
            type: 'boardDataLoaded',
            payload: {
              boardId,
              columns: data.columns,
              categories: data.categories,
              taskCards: data.taskCards,
              subTasks: data.subTasks,
            },
          })
        } else {
          // Board-level op: re-hydrate the whole doc.
          const payload = await fetchPlannerData()
          dispatch({ type: 'dataFetchedFromDatabase', payload })
        }
      } catch {
        toast.error('Could not reach the server. Recent changes may not be saved.')
      }
    })
  })
}

/*
 * Debounced variant for keystroke-driven saves, keyed per entity. The old
 * implementation shared one module-level debounce across all entities, so
 * editing card A's title and then clicking into card B within 500ms silently
 * cancelled A's save forever.
 */
const debouncedSenders = new Map<
  string,
  DebouncedFn<[PlannerDispatchContextType, () => Promise<unknown>, string | undefined]>
>()

export function sendDebouncedMutation(
  key: string,
  dispatch: PlannerDispatchContextType,
  request: () => Promise<unknown>,
  boardId?: string
): void {
  let sender = debouncedSenders.get(key)
  if (!sender) {
    sender = debounce(
      (
        latestDispatch: PlannerDispatchContextType,
        latestRequest: () => Promise<unknown>,
        latestBoardId: string | undefined
      ) => {
        debouncedSenders.delete(key)
        sendMutation(latestDispatch, latestRequest, latestBoardId)
      },
      DEBOUNCE_TIME_MS
    )
    debouncedSenders.set(key, sender)
  }
  sender(dispatch, request, boardId)
}

/*
 * Forces a key's pending debounced save to fire NOW instead of waiting out the
 * trailing timer. The editor calls this on close/unmount so a final keystroke
 * isn't dropped by a timer that never gets the chance to fire. No-op when the
 * key has nothing pending. The wrapped sender already deletes itself from the
 * Map when it fires (here, synchronously inside flush); the trailing delete is
 * an idempotent safety net.
 */
export function flushDebouncedMutation(key: string): void {
  const sender = debouncedSenders.get(key)
  if (!sender) {
    return
  }
  sender.flush()
  debouncedSenders.delete(key)
}
