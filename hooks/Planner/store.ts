import { PlannerAction, PlannerType } from './types'

/*
 * Minimal external store for the planner DATA state, backed by the existing
 * immer plannerReducer. Replaces useReducer-over-context so consumers can
 * subscribe to a SLICE (via usePlannerSelector) instead of the whole tree:
 * any dispatch re-runs only the listeners whose selected slice actually
 * changed reference. immer keeps untouched slices referentially stable, which
 * is what makes the default referential-equality check in
 * useSyncExternalStoreWithSelector both correct and minimal.
 *
 * The store is created ONCE per provider (useRef), so getState/dispatch/
 * subscribe are stable identities for the provider's lifetime.
 */
export type PlannerStore = {
  getState: () => PlannerType
  dispatch: (action: PlannerAction) => void
  subscribe: (listener: () => void) => () => void
}

export function createPlannerStore(
  initialState: PlannerType,
  reducer: (state: PlannerType, action: PlannerAction) => PlannerType
): PlannerStore {
  let state = initialState
  const listeners = new Set<() => void>()

  const getState = () => state

  const dispatch = (action: PlannerAction) => {
    const next = reducer(state, action)
    // immer returns the same reference when nothing changed; skip notifying then
    // so a no-op dispatch can't trigger a render pass.
    if (next === state) {
      return
    }
    state = next
    // Snapshot listeners before notifying: a listener that subscribes/unsubscribes
    // during notification must not mutate the set we're iterating.
    for (const listener of Array.from(listeners)) {
      listener()
    }
  }

  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  return { getState, dispatch, subscribe }
}
