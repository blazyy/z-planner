import { Dispatch } from 'react'

export type ColumnInfoType = {
  id: string
  name: string
  taskCards: string[]
}

export type SubTaskInfoType = {
  id: string
  title: string
  checked: boolean
}

export type TaskCardInfoType = {
  id: string
  title: string
  category: string
  content: string
  checked: boolean
  subTasks: string[]
}

export type TaskCardBeingInitializedType = {
  taskCardId: string
  columnId: string
  isHighlighted: boolean
}

export type TaskCategoryType = {
  [name: string]: {
    color: string
  }
}

export type BoardInfoType = {
  id: string
  name: string
  columns: string[]
}

export type TaskCardsType = {
  [taskCardId: string]: TaskCardInfoType
}

export type SubTasksType = {
  [subTaskId: string]: SubTaskInfoType
}

export type ColumnsType = {
  [columnId: string]: ColumnInfoType
}

export type BoardsType = {
  [boardId: string]: BoardInfoType
}

// isSubTaskBeingDragged - Used to hide/show drag handles on subtasks on a TaskCard Dialog. Handles should only be shown when
// hovered over (and not actively dragging a subtask), or, when actively dragging a subtask. The only
// way to handle this is using onDragStart and onDragEnd handlers, which are only available on the
// DragDropContext component. This is why this state is in the parent, while it's being used way below
// in the component tree.

// idOfCardBeingDragged - Used to handle transparency of card while being dragged. isDragging could't be used because of
// a decision to use a wrapper component which made passing the isDragging prop very tricky

// taskCardBeingInitialized - Contains data of card that's being initialized. Didn't make sense to keep this in the store, since the data
// is only changed in a few places.

// dataEnteredInTaskCardBeingInitialized - Used when a new task card is added when a previously added one is still being edited- we don't want to lose the information
// in the previous one.

// const initialState = useState(undefined)

export type PlannerType = {
  hasLoaded: boolean
  isSubTaskBeingDragged: boolean
  idOfCardBeingDragged: string
  taskCardBeingInitialized: TaskCardBeingInitializedType | null
  dataEnteredInTaskCardBeingInitialized: boolean
  boardOrder: string[]
  boards: BoardsType
  columns: ColumnsType
  categories: TaskCategoryType
  taskCards: TaskCardsType
  subTasks: SubTasksType
}

export type PlannerDispatchContextType = Dispatch<any>
