import axios from 'axios'
import { ReactNode, createContext, useContext, useEffect, useReducer, useRef } from 'react'
import { useErrorBoundary } from 'react-error-boundary'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector'

import { emptyPlannerData, fetchBoard, fetchPlannerSummary } from '@/utils/plannerUtils/apiClient'

import { ephemeralReducer } from './ephemeralReducer'
import { plannerReducer } from './plannerReducer'
import { PlannerStore, createPlannerStore } from './store'
import { EphemeralDispatchContextType, EphemeralStateType, PlannerDispatchContextType, PlannerType } from './types'

const initialEphemeralState: EphemeralStateType = {
  hasLoaded: false,
  isSubTaskBeingDragged: false,
  taskCardBeingInitialized: null,
  dataEnteredInTaskCardBeingInitialized: false,
  loadedBoardIds: {},
}

/*
 * The DATA planner state now lives in an external store (see store.ts) instead
 * of useReducer-over-context, so consumers can subscribe to a SLICE via
 * usePlannerSelector and re-render only when that slice changes. The store is
 * provided as a stable ref through PlannerStoreContext; dispatch is derived from
 * it. A fallback store backs the default context value so the typed hooks never
 * read null outside a provider (matching the old context defaults).
 *
 * Ephemeral UI state stays a plain reducer-over-context (separate small context)
 * exactly as before — only the DATA subscription mechanism changed.
 */
const fallbackStore: PlannerStore = createPlannerStore(emptyPlannerData, plannerReducer)

export const PlannerStoreContext = createContext<PlannerStore>(fallbackStore)
export const PlannerDispatchContext = createContext<PlannerDispatchContextType>(fallbackStore.dispatch)

export const PlannerEphemeralContext = createContext<EphemeralStateType>(initialEphemeralState)
export const PlannerEphemeralDispatchContext = createContext<EphemeralDispatchContextType>(() => {})

export const usePlannerStore = (): PlannerStore => {
  return useContext(PlannerStoreContext)
}

/*
 * Subscribe to a derived SLICE of the planner data. Re-renders only when the
 * selected value changes per isEqual (default: Object.is / referential).
 *
 * ANTI-FOOTGUN: a selector that builds a NEW object/array on every call (e.g.
 * `s => ({ a: s.a, b: s.b })` or `s => ids.map(id => s.map[id])`) is never
 * referentially equal to the previous result, so it re-renders every dispatch
 * and — without a stable isEqual — can loop. PREFER one call per primitive
 * slice (`usePlannerSelector(s => s.boards)`, `s => s.taskCards[id]`); immer
 * keeps untouched slices referentially stable, so default equality is both
 * correct and minimal. For combined/derived values, select inputs separately
 * and combine in render, OR pass a shallow isEqual.
 */
export function usePlannerSelector<T>(selector: (state: PlannerType) => T, isEqual?: (a: T, b: T) => boolean): T {
  const store = useContext(PlannerStoreContext)
  return useSyncExternalStoreWithSelector(
    store.subscribe,
    store.getState,
    store.getState, // server snapshot: same source, store is seeded synchronously
    selector,
    isEqual
  )
}

/*
 * Back-compat: returns the WHOLE planner state. Re-renders on ANY data change,
 * exactly like the old context. Un-migrated consumers keep working; migrate hot
 * ones to usePlannerSelector for granular subscriptions.
 */
export const usePlanner = (): PlannerType => {
  return usePlannerSelector((state) => state)
}

export const usePlannerDispatch = (): PlannerDispatchContextType => {
  return useContext(PlannerDispatchContext)
}

export const usePlannerEphemeral = () => {
  return useContext(PlannerEphemeralContext)
}

export const usePlannerEphemeralDispatch = () => {
  return useContext(PlannerEphemeralDispatchContext)
}

/*
 * Lazy per-board load. On mount (or boardId change) fetches the board's heavy
 * slice if it hasn't been loaded yet, merges it via boardDataLoaded, and marks
 * the board loaded in ephemeral state. Returns whether the board's slice is now
 * present so the caller (the board page) can keep showing the skeleton until
 * then — preserving the old "skeleton, then board" behavior while the upfront
 * whole-doc fetch is gone.
 *
 * Idempotent: a board already in loadedBoardIds skips the fetch. The request is
 * aborted on unmount/boardId change so a stale board's slice can't land over a
 * newer one (StrictMode double-mount / quick navigation safe).
 */
export function useEnsureBoardLoaded(boardId: string): boolean {
  const { showBoundary } = useErrorBoundary()
  const store = usePlannerStore()
  const ephemeral = usePlannerEphemeral()
  const ephemeralDispatch = usePlannerEphemeralDispatch()
  const isLoaded = Boolean(ephemeral.loadedBoardIds[boardId])
  // Only the summary tells us a board exists; fetching a board absent from it
  // would 404 -> error boundary. The page routes non-existent boards to
  // notFound() instead, so we simply never trigger the fetch for them.
  const boardExists = usePlannerSelector((s) => Boolean(s.boards[boardId]))

  useEffect(() => {
    if (isLoaded || !boardExists) {
      return
    }
    const controller = new AbortController()
    fetchBoard(boardId, controller.signal)
      .then((data) => {
        store.dispatch({
          type: 'boardDataLoaded',
          payload: {
            boardId,
            columns: data.columns,
            categories: data.categories,
            taskCards: data.taskCards,
            subTasks: data.subTasks,
          },
        })
        ephemeralDispatch({ type: 'boardLoaded', payload: { boardId } })
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          showBoundary(error)
        }
      })
    return () => controller.abort()
  }, [boardId, isLoaded, boardExists, store, ephemeralDispatch, showBoundary])

  return isLoaded
}

export const PlannerProvider = ({ children }: { children: ReactNode }) => {
  const { showBoundary } = useErrorBoundary()
  // Create the store ONCE: stable getState/dispatch/subscribe for the provider's
  // lifetime, seeded with emptyPlannerData and backed by the unchanged reducer.
  const storeRef = useRef<PlannerStore>()
  if (!storeRef.current) {
    storeRef.current = createPlannerStore(emptyPlannerData, plannerReducer)
  }
  const store = storeRef.current

  const [ephemeral, ephemeralDispatch] = useReducer(ephemeralReducer, initialEphemeralState)

  useEffect(() => {
    if (ephemeral.hasLoaded) {
      return
    }
    // Abort on unmount so a StrictMode double-mount (or quick navigation) can't
    // resolve a stale fetch over the live store.
    const controller = new AbortController()
    fetchPlannerSummary(controller.signal)
      .then((payload) => {
        store.dispatch({ type: 'summaryLoaded', payload })
        ephemeralDispatch({ type: 'dataLoaded' })
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          showBoundary(error)
        }
      })
    return () => controller.abort()
  }, [showBoundary, ephemeral.hasLoaded, store])

  return (
    <PlannerStoreContext.Provider value={store}>
      <PlannerDispatchContext.Provider value={store.dispatch}>
        <PlannerEphemeralContext.Provider value={ephemeral}>
          <PlannerEphemeralDispatchContext.Provider value={ephemeralDispatch}>
            {children}
          </PlannerEphemeralDispatchContext.Provider>
        </PlannerEphemeralContext.Provider>
      </PlannerDispatchContext.Provider>
    </PlannerStoreContext.Provider>
  )
}
