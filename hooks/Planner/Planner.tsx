import axios from 'axios'
import { ReactNode, createContext, useContext, useEffect, useReducer } from 'react'
import { useErrorBoundary } from 'react-error-boundary'

import { emptyPlannerState, fetchPlannerData } from '@/utils/plannerUtils/apiClient'

import { plannerReducer } from './plannerReducer'
import { PlannerDispatchContextType, PlannerType } from './types'

export const PlannerContext = createContext<PlannerType>(emptyPlannerState)
export const PlannerDispatchContext = createContext<PlannerDispatchContextType>(() => {})

export const usePlanner = () => {
  return useContext(PlannerContext)
}

export const usePlannerDispatch = () => {
  return useContext(PlannerDispatchContext)
}

export const PlannerProvider = ({ children }: { children: ReactNode }) => {
  const { showBoundary } = useErrorBoundary()
  const [plannerData, dispatch] = useReducer(plannerReducer, emptyPlannerState)

  useEffect(() => {
    if (plannerData.hasLoaded) {
      return
    }
    // Abort on unmount so a StrictMode double-mount (or quick navigation) can't
    // resolve a stale fetch over the live store.
    const controller = new AbortController()
    fetchPlannerData(controller.signal)
      .then((payload) => {
        dispatch({ type: 'dataFetchedFromDatabase', payload })
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          showBoundary(error)
        }
      })
    return () => controller.abort()
  }, [showBoundary, plannerData.hasLoaded])

  return (
    <PlannerContext.Provider value={plannerData}>
      <PlannerDispatchContext.Provider value={dispatch}>{children}</PlannerDispatchContext.Provider>
    </PlannerContext.Provider>
  )
}
