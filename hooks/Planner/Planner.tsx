import { Dispatch, createContext, useContext, useEffect, useReducer } from 'react'
import { useDatabase } from '../Database/Database'
import { plannerReducer } from './plannerReducer'
import { PlannerType } from './types'

const initialEmptyState: PlannerType = {
  dataLoaded: false,
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

export const PlannerContext = createContext<PlannerType | undefined>(undefined)
export const PlannerDispatchContext = createContext<Dispatch<any>>(() => {})

export const PlannerProvider = ({ children }: { children: JSX.Element | JSX.Element[] }) => {
  const db = useDatabase()
  // isSubTaskBeingDragged - Used to hide/show drag handles on subtasks on a TaskCard Dialog. Handles should only be shown when
  // hovered over (and not actively dragging a subtask), or, when actively dragging a subtask. The only
  // way to handle this is using onDragStart and onDragEnd handlers, which are only available on the
  // DragDropContext component. This is why this state is in the parent, while it's being used way below
  // in the component tree.

  // idOfCardBeingDragged - Used to handle transparency of card while being dragged. isDragging couldn't be used because of
  // a decision to use a wrapper component which made passing the isDragging prop very tricky

  // taskCardBeingInitialized - Contains data of card that's being initialized. Didn't make sense to keep this in the store, since the data
  // is only changed in a few places.

  // dataEnteredInTaskCardBeingInitialized - Used when a new task card is added when a previously added one is still being edited- we don't want to lose the information
  // in the previous one.

  // const initialState = useState(undefined)

  const [plannerData, dispatch] = useReducer(plannerReducer, initialEmptyState)

  useEffect(() => {
    const fetchInitialPlannerData = async () => {
      const data = await db.getInitialPlannerData()
      const initialState: PlannerType = {
        ...initialEmptyState,
        dataLoaded: true,
        ...data,
      }
      dispatch({
        type: 'dataFetchedFromDatabase',
        payload: initialState,
      })
    }
    fetchInitialPlannerData()
  }, [db])

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
