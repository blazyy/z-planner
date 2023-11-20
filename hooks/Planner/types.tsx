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

export type PlannerType = {
  dataLoaded: false
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

export type PlannerDispatchContextType = Dispatch<any> | null
