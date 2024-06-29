import { useAuth } from '@clerk/nextjs'
import axios from 'axios'
import { Dispatch, createContext, useContext, useEffect, useReducer } from 'react'
import { useErrorBoundary } from 'react-error-boundary'
import { plannerReducer } from './plannerReducer'
import { PlannerType } from './types'

const initialEmptyState: PlannerType = {
  backendErrorOccurred: false,
  hasLoaded: false,
  selectedBoard: '',
  isSubTaskBeingDragged: false,
  idOfCardBeingDragged: '',
  taskCardBeingInitialized: null,
  dataEnteredInTaskCardBeingInitialized: false,
  scheduledTaskCards: [],
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
  const { getToken } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken()
      axios
        .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          const data = response.data
          dispatch({
            type: 'dataFetchedFromDatabase',
            payload: {
              ...initialEmptyState,
              hasLoaded: true,
              selectedBoard: data.boardOrder.length > 0 ? data.boardOrder[0] : '',
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
  }, [showBoundary, getToken])

  return (
    <PlannerContext.Provider value={plannerData}>
      <PlannerDispatchContext.Provider value={dispatch}>{children}</PlannerDispatchContext.Provider>
    </PlannerContext.Provider>
  )
}
