import { LoadingSpinner } from '@/components/global/LoadingSpinner/LoadingSpinner'
import { useAuth } from '@clerk/nextjs'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Dispatch, createContext, useContext, useEffect, useReducer } from 'react'
import { useErrorBoundary } from 'react-error-boundary'
import { plannerReducer } from './plannerReducer'
import { PlannerType } from './types'

const initialEmptyState: PlannerType = {
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

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['plannerData'],
    queryFn: async () => {
      const token = await getToken()
      return axios
        .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => response.data)
        .catch((error) => showBoundary(error))
    },
  })

  useEffect(() => {
    if (data) {
      dispatch({
        type: 'dataFetchedFromDatabase',
        payload: {
          ...initialEmptyState,
          selectedBoard: data.boardOrder.length > 0 ? data.boardOrder[0] : '',
          boardOrder: data.boardOrder,
          boards: data.boards,
          columns: data.columns,
          categories: data.categories,
          taskCards: data.taskCards,
          subTasks: data.subTasks,
        },
      })
    }
  }, [data, dispatch])

  if (isPending) {
    return <LoadingSpinner />
  }

  if (isError) {
    showBoundary(error)
  }

  return (
    <PlannerContext.Provider value={plannerData}>
      <PlannerDispatchContext.Provider value={dispatch}>{children}</PlannerDispatchContext.Provider>
    </PlannerContext.Provider>
  )
}
