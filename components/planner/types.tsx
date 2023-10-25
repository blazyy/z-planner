import { SupabaseClient } from '@supabase/supabase-js'
import { Dispatch, SetStateAction } from 'react'
import { TaskCategoryType } from './TaskColumns/TaskCard/CategoryBadge'
import { ColumnInfoType, SubTaskInfoType, TaskCardInfoType } from './TaskColumns/TaskColumn'

export type PlannerDataType = {
  columns: {
    [columnId: string]: ColumnInfoType
  }
  columnOrder: string[]
  categories: TaskCategoryType
  taskCards: {
    [taskCardId: string]: TaskCardInfoType
  }
  subTasks: {
    [taskId: string]: SubTaskInfoType
  }
}

export type TaskCardBeingInitializedType = {
  taskCardId: string
  columnId: string
  isHighlighted: boolean
}

export type PlannerContextType = {
  isSubTaskBeingDragged: boolean
  setIsSubTaskBeingDragged: Dispatch<SetStateAction<boolean>>
  idOfCardBeingDragged: string
  setIdOfCardBeingDragged: Dispatch<SetStateAction<string>>
  taskCardBeingInitialized: TaskCardBeingInitializedType | null
  setTaskCardBeingInitialized: Dispatch<SetStateAction<TaskCardBeingInitializedType | null>>
  dataEnteredInTaskCardBeingInitialized: boolean
  setDataEnteredInTaskCardBeingInitialized: Dispatch<SetStateAction<boolean>>
  supabaseClient: SupabaseClient
}
