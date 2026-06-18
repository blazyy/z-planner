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

// PlannerType is the persisted, normalized planner data. Ephemeral UI state
// (see EphemeralStateType) lives in a separate context + reducer so a refetch or
// a data mutation can't churn transient UI flags, and vice versa.
export type PlannerType = {
  boardOrder: string[]
  boards: BoardsType
  categories: CategoriesType
  columns: ColumnsType
  taskCards: TaskCardsType
  subTasks: SubTasksType
}

// The light first-load payload (GET /api/planner/summary): just the board
// metadata the sidebar needs up front. Heavy per-board slices (columns/cards/
// subtasks) are fetched lazily when a board is opened.
export type PlannerSummaryType = {
  boardOrder: string[]
  boards: BoardsType
  categories: CategoriesType
}

// One board's heavy slice (GET /api/planner/boards/[boardId]): the columns,
// cards, subtasks and categories for that board, merged into the store on open.
export type BoardDataType = {
  board: BoardInfoType
  columns: ColumnsType
  categories: CategoriesType
  taskCards: TaskCardsType
  subTasks: SubTasksType
}

// Ephemeral, never-persisted UI state. Split out of PlannerType so the data
// reducer stays purely about normalized entities.
//
// hasLoaded - Gates the one-shot mount fetch and the loading skeleton/spinner: false until
// the initial planner data resolves, then true for the lifetime of the provider.
//
// isSubTaskBeingDragged - Used to hide/show drag handles on subtasks on a TaskCard Dialog. Handles should only be shown when
// hovered over (and not actively dragging a subtask), or, when actively dragging a subtask. The only
// way to handle this is using onDragStart and onDragEnd handlers, which are only available on the
// DragDropContext component. This is why this state is in the parent, while it's being used way below
// in the component tree.
//
// taskCardBeingInitialized - Contains data of card that's being initialized. Didn't make sense to keep this in the store, since the data
// is only changed in a few places.
//
// dataEnteredInTaskCardBeingInitialized - Used when a new task card is added when a previously added one is still being edited- we don't want to lose the information
// in the previous one.
//
// loadedBoardIds - The set of board ids whose heavy slice (columns/cards/
// subtasks) has been fetched and merged into the store. Used to gate the
// per-board lazy load: a board page shows the skeleton until its id is here,
// and the mount effect skips re-fetching a board already loaded. A record (id
// -> true) rather than a Set so it stays a plain serializable value the immer
// reducer can update structurally.
export type EphemeralStateType = {
  hasLoaded: boolean
  isSubTaskBeingDragged: boolean
  taskCardBeingInitialized: TaskCardBeingInitializedType | null
  dataEnteredInTaskCardBeingInitialized: boolean
  loadedBoardIds: Record<string, true>
}

// One discriminated union for every DATA reducer action, so dispatch sites get
// compile-time payload checking and the reducer switch can be exhaustive.
export type PlannerAction =
  | { type: 'dataFetchedFromDatabase'; payload: PlannerType }
  | { type: 'summaryLoaded'; payload: PlannerSummaryType }
  | {
      type: 'boardDataLoaded'
      payload: {
        boardId: string
        columns: ColumnsType
        categories: CategoriesType
        taskCards: TaskCardsType
        subTasks: SubTasksType
      }
    }
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
  | {
      type: 'newTaskCardAdded'
      payload: { columnId: string; newTaskCardDetails: TaskCardInfoType; updatedTaskCards: string[] }
    }
  | { type: 'taskCardCheckedStatusChanged'; payload: { columnId: string; taskCardId: string; isChecked: boolean } }
  | { type: 'taskCardTitleChanged'; payload: { taskCardId: string; newTitle: string } }
  | { type: 'taskCardContentChanged'; payload: { taskCardId: string; newContent: string } }
  | { type: 'taskCardDeleted'; payload: { columnId: string; taskCardId: string } }
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

// Discriminated union for every EPHEMERAL UI action, dispatched against the
// ephemeral reducer/context. Kept separate from PlannerAction so a data
// mutation can't carry a UI flag and vice versa.
export type EphemeralAction =
  | { type: 'dataLoaded' }
  | { type: 'boardLoaded'; payload: { boardId: string } }
  | { type: 'subTaskDragStatusChanged'; payload: boolean }
  | { type: 'newTaskCardInitialized'; payload: TaskCardBeingInitializedType }
  | { type: 'taskCardInitializationCancelled'; payload?: null }
  | { type: 'taskCardBeingInitializedHighlightStatusChange'; payload: boolean }
  | { type: 'dataEnteredInTaskCardBeingInitializedStatusChanged'; payload: boolean }

export type EphemeralDispatchContextType = Dispatch<EphemeralAction>
