import axios from 'axios'
import { Dispatch, createContext, useContext, useEffect, useReducer } from 'react'
import { useErrorBoundary } from 'react-error-boundary'
import { plannerReducer } from './plannerReducer'
import { PlannerType } from './types'

const initialEmptyState: PlannerType = {
  hasLoaded: false,
  isSubTaskBeingDragged: false,
  idOfCardBeingDragged: '',
  taskCardBeingInitialized: null,
  dataEnteredInTaskCardBeingInitialized: false,
  boardOrder: [],
  boards: {},
  columns: {},
  categories: {},
  taskCards: {},
  subTasks: {},
}

export const PlannerContext = createContext<PlannerType>(initialEmptyState)
export const PlannerDispatchContext = createContext<Dispatch<any>>(() => {})

export const usePlanner = () => {
  return useContext(PlannerContext)
}

export const usePlannerDispatch = () => {
  return useContext(PlannerDispatchContext)
}

export const PlannerProvider = ({ children }: { children: JSX.Element | JSX.Element[] }) => {
  const { showBoundary } = useErrorBoundary()
  const [plannerData, dispatch] = useReducer(plannerReducer, initialEmptyState)

  useEffect(() => {
    const fetchData = async () => {
      axios
        .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner`)
        .then((response) => {
          const data = response.data
          dispatch({
            type: 'dataFetchedFromDatabase',
            payload: {
              ...initialEmptyState,
              hasLoaded: true,
              boardOrder: data.boardOrder,
              boards: data.boards,
              columns: data.columns,
              categories: data.categories,
              taskCards: data.taskCards,
              subTasks: data.subTasks,
            },
          })
        })
        .catch((error) => showBoundary(error))
    }
    fetchData()
  }, [showBoundary])

  return (
    <PlannerContext.Provider value={plannerData}>
      <PlannerDispatchContext.Provider value={dispatch}>{children}</PlannerDispatchContext.Provider>
    </PlannerContext.Provider>
  )
}
