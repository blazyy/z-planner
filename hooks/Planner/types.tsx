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
  status: 'created' | 'archived' | 'completed'
  subTasks: string[]
}

export type TaskCardBeingInitializedType = {
  taskCardId: string
  columnId: string
  isHighlighted: boolean
}

export type TaskCategoryType = {
  id: string
  name: string
  color: string
}

export type BoardInfoType = {
  id: string
  name: string
  columns: string[]
  categories: string[]
}

export type CategoriesType = {
  [id: string]: TaskCategoryType
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

// taskCardBeingInitialized - Contains data of card that's being initialized. Didn't make sense to keep this in the store, since the data
// is only changed in a few places.

// dataEnteredInTaskCardBeingInitialized - Used when a new task card is added when a previously added one is still being edited- we don't want to lose the information
// in the previous one.

export type PlannerType = {
  hasLoaded: boolean
  isSubTaskBeingDragged: boolean
  taskCardBeingInitialized: TaskCardBeingInitializedType | null
  dataEnteredInTaskCardBeingInitialized: boolean
  boardOrder: string[]
  boards: BoardsType
  columns: ColumnsType
  categories: CategoriesType
  taskCards: TaskCardsType
  subTasks: SubTasksType
}

// One discriminated union for every reducer action, so dispatch sites get
// compile-time payload checking and the reducer switch can be exhaustive.
export type PlannerAction =
  | { type: 'dataFetchedFromDatabase'; payload: PlannerType }
  | {
      type: 'newBoardAdded'
      payload: { boardId: string; boardName: string; unassignedCategoryDetails: TaskCategoryType }
    }
  | { type: 'boardNameChanged'; payload: { boardId: string; newName: string } }
  | { type: 'boardDeleted'; payload: { boardId: string } }
  | {
      type: 'newColumnAdded'
      payload: { boardId: string; newColumnDetails: ColumnInfoType; updatedColumns: string[] }
    }
  | { type: 'columnDeleted'; payload: { boardId: string; columnId: string } }
  | { type: 'columnNameChanged'; payload: { columnId: string; newName: string } }
  | { type: 'columnsReordered'; payload: { boardId: string; newColumnOrder: string[] } }
  | { type: 'cardMovedWithinColumn'; payload: { columnId: string; reorderedCardIds: string[] } }
  | {
      type: 'cardMovedAcrossColumns'
      payload: {
        sourceColumnId: string
        destColumnId: string
        sourceColumnTaskCardIds: string[]
        destColumnTaskCardIds: string[]
      }
    }
  | { type: 'taskCardInitializationCancelled'; payload?: null }
  | { type: 'newTaskCardInitialized'; payload: TaskCardBeingInitializedType }
  | { type: 'taskCardBeingInitializedHighlightStatusChange'; payload: boolean }
  | { type: 'dataEnteredInTaskCardBeingInitializedStatusChanged'; payload: boolean }
  | {
      type: 'newTaskCardAdded'
      payload: { columnId: string; newTaskCardDetails: TaskCardInfoType; updatedTaskCards: string[] }
    }
  | { type: 'taskCardCheckedStatusChanged'; payload: { columnId: string; taskCardId: string; isChecked: boolean } }
  | { type: 'taskCardTitleChanged'; payload: { taskCardId: string; newTitle: string } }
  | { type: 'taskCardContentChanged'; payload: { taskCardId: string; newContent: string } }
  | { type: 'taskCardDeleted'; payload: { columnId: string; taskCardId: string } }
  | { type: 'subTaskDragStatusChanged'; payload: boolean }
  | { type: 'subTasksReordered'; payload: { taskCardId: string; reorderedSubTasks: string[] } }
  | { type: 'subTasksCheckedStatusChanged'; payload: { subTaskId: string; isChecked: boolean } }
  | { type: 'subTaskTitleChanged'; payload: { subTaskId: string; newTitle: string } }
  | {
      type: 'newSubTaskAdded'
      payload: { taskCardId: string; newSubTaskDetails: SubTaskInfoType; newSubTasksOrder: string[] }
    }
  | {
      type: 'subTaskDeletedOnBackspaceKeydown'
      payload: { taskCardId: string; subTaskId: string; newSubtasks: string[] }
    }
  | { type: 'taskCategoryChanged'; payload: { taskCardId: string; newCategoryId: string } }
  | { type: 'newCategoryAdded'; payload: { boardId: string; newCategoryDetails: TaskCategoryType } }
  | { type: 'categoryInfoChanged'; payload: { categoryDetails: TaskCategoryType } }
  | { type: 'categoryDeleted'; payload: { boardId: string; categoryId: string } }

export type PlannerDispatchContextType = Dispatch<PlannerAction>
