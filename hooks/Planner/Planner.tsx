import axios from 'axios'
import { ReactNode, createContext, useContext, useEffect, useReducer } from 'react'
import { useErrorBoundary } from 'react-error-boundary'

import { emptyPlannerData, fetchPlannerData } from '@/utils/plannerUtils/apiClient'

import { ephemeralReducer } from './ephemeralReducer'
import { plannerReducer } from './plannerReducer'
import { EphemeralDispatchContextType, EphemeralStateType, PlannerDispatchContextType, PlannerType } from './types'

const initialEphemeralState: EphemeralStateType = {
  hasLoaded: false,
  isSubTaskBeingDragged: false,
  taskCardBeingInitialized: null,
  dataEnteredInTaskCardBeingInitialized: false,
}

export const PlannerContext = createContext<PlannerType>(emptyPlannerData)
export const PlannerDispatchContext = createContext<PlannerDispatchContextType>(() => {})

export const PlannerEphemeralContext = createContext<EphemeralStateType>(initialEphemeralState)
export const PlannerEphemeralDispatchContext = createContext<EphemeralDispatchContextType>(() => {})

export const usePlanner = () => {
  return useContext(PlannerContext)
}

export const usePlannerDispatch = () => {
  return useContext(PlannerDispatchContext)
}

export const usePlannerEphemeral = () => {
  return useContext(PlannerEphemeralContext)
}

export const usePlannerEphemeralDispatch = () => {
  return useContext(PlannerEphemeralDispatchContext)
}

export const PlannerProvider = ({ children }: { children: ReactNode }) => {
  const { showBoundary } = useErrorBoundary()
  const [plannerData, dispatch] = useReducer(plannerReducer, emptyPlannerData)
  const [ephemeral, ephemeralDispatch] = useReducer(ephemeralReducer, initialEphemeralState)

  useEffect(() => {
    if (ephemeral.hasLoaded) {
      return
    }
    // Abort on unmount so a StrictMode double-mount (or quick navigation) can't
    // resolve a stale fetch over the live store.
    const controller = new AbortController()
    fetchPlannerData(controller.signal)
      .then((payload) => {
        dispatch({ type: 'dataFetchedFromDatabase', payload })
        ephemeralDispatch({ type: 'dataLoaded' })
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          showBoundary(error)
        }
      })
    return () => controller.abort()
  }, [showBoundary, ephemeral.hasLoaded])

  return (
    <PlannerContext.Provider value={plannerData}>
      <PlannerDispatchContext.Provider value={dispatch}>
        <PlannerEphemeralContext.Provider value={ephemeral}>
          <PlannerEphemeralDispatchContext.Provider value={ephemeralDispatch}>
            {children}
          </PlannerEphemeralDispatchContext.Provider>
        </PlannerEphemeralContext.Provider>
      </PlannerDispatchContext.Provider>
    </PlannerContext.Provider>
  )
}
