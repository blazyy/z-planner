import { Dispatch, createContext, useContext, useEffect, useReducer } from 'react'
// import data from '../../components/planner/TaskColumns/initial-data'
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

export const PlannerProvider = ({ children }: { children: JSX.Element | JSX.Element[] }) => {
  const [plannerData, dispatch] = useReducer(plannerReducer, initialEmptyState)

  useEffect(() => {
    const fetchInitialPlannerData = () => {
      fetch('/api/planner', {
        method: 'GET',
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
          }
          return response.json()
        })
        .then((data) => {
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
        .catch((error) => {
          console.error('Error fetching data:', error)
        })
    }
    fetchInitialPlannerData()
  }, [])

  return (
    <PlannerContext.Provider value={plannerData}>
      <PlannerDispatchContext.Provider value={dispatch}>{children}</PlannerDispatchContext.Provider>
    </PlannerContext.Provider>
  )
}

export const usePlanner = () => {
  return useContext(PlannerContext)
}

export const usePlannerDispatch = () => {
  return useContext(PlannerDispatchContext)
}
