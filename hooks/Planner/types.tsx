import { Dispatch } from 'react'

export type ColumnInfoType = {
  id: string
  title: string
  cardIds: string[]
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

export type PlannerDataType = {
  boardOrder: string[]
  boards: {
    [boardId: string]: BoardInfoType
  }
  columns: {
    [columnId: string]: ColumnInfoType
  }
  categories: TaskCategoryType
  taskCards: {
    [taskCardId: string]: TaskCardInfoType
  }
  subTasks: {
    [taskId: string]: SubTaskInfoType
  }
}

export type PlannerType = {
  isSubTaskBeingDragged: boolean
  idOfCardBeingDragged: string
  taskCardBeingInitialized: TaskCardBeingInitializedType | null
  dataEnteredInTaskCardBeingInitialized: boolean
  data: PlannerDataType
}

export type PlannerDispatchContextType = Dispatch<any> | null
