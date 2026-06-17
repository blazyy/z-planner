import axios from 'axios'
import { toast } from 'sonner'

import { DEBOUNCE_TIME_MS } from '@/constants/constants'
import { PlannerDispatchContextType, PlannerType } from '@/hooks/Planner/types'

/*
 * Minimal trailing-edge debounce, replacing lodash/debounce. Each call resets
 * the timer; when it fires, the wrapped fn runs once with the LATEST args. This
 * matches lodash's default { leading: false, trailing: true } semantics, which
 * is all the per-key debouncedSenders Map relied on.
 */
type DebouncedFn<A extends unknown[]> = (...args: A) => void

function debounce<A extends unknown[]>(fn: (...args: A) => void, waitMs: number): DebouncedFn<A> {
  let timer: ReturnType<typeof setTimeout> | undefined
  let latestArgs: A
  return (...args: A) => {
    latestArgs = args
    if (timer !== undefined) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      timer = undefined
      fn(...latestArgs)
    }, waitMs)
  }
}

export const emptyPlannerState: PlannerType = {
  hasLoaded: false,
  isSubTaskBeingDragged: false,
  taskCardBeingInitialized: null,
  dataEnteredInTaskCardBeingInitialized: false,
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
    ...emptyPlannerState,
    hasLoaded: true,
    boardOrder: data.boardOrder,
    boards: data.boards,
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
 * fails, the store has diverged from the server, so recovery is: surface an
 * error toast, then re-hydrate the store from the server once the queue
 * drains. Convergent and simple, at the cost of discarding whatever optimistic
 * edits were still in flight behind the failure.
 */
let writeChain: Promise<unknown> = Promise.resolve()
let refetchScheduled = false

export function sendMutation(dispatch: PlannerDispatchContextType, request: () => Promise<unknown>): void {
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
        const payload = await fetchPlannerData()
        dispatch({ type: 'dataFetchedFromDatabase', payload })
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
const debouncedSenders = new Map<string, DebouncedFn<[PlannerDispatchContextType, () => Promise<unknown>]>>()

export function sendDebouncedMutation(
  key: string,
  dispatch: PlannerDispatchContextType,
  request: () => Promise<unknown>
): void {
  let sender = debouncedSenders.get(key)
  if (!sender) {
    sender = debounce((latestDispatch: PlannerDispatchContextType, latestRequest: () => Promise<unknown>) => {
      debouncedSenders.delete(key)
      sendMutation(latestDispatch, latestRequest)
    }, DEBOUNCE_TIME_MS)
    debouncedSenders.set(key, sender)
  }
  sender(dispatch, request)
}
