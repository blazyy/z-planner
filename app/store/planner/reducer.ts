import { createSlice } from '@reduxjs/toolkit'

import { PlannerDataType } from '@/components/planner/TaskColumns/TaskColumns'

import initialData from '@/components/planner/TaskColumns/initial-data'

type TaskCardBeingInitializedInfoType = {
  taskCardId: string
  columnId: string
}

type InitialState = {
  data: PlannerDataType
  taskCardBeingInitializedInfo: TaskCardBeingInitializedInfoType | null
  isSubTaskBeingDragged: boolean
  idOfCardBeingDragged: string
}

const initialState: InitialState = {
  data: initialData,
  taskCardBeingInitializedInfo: null,
  isSubTaskBeingDragged: false,
  idOfCardBeingDragged: '',
}

export const plannerSlice = createSlice({
  name: 'planner',
  initialState: initialState,
  reducers: {
    columnsReordered: (state, action) => {
      const { draggableId, sourceIndex, destIndex } = action.payload
      const newColumnOrder = Array.from(state.data.columnOrder)
      newColumnOrder.splice(sourceIndex, 1)
      newColumnOrder.splice(destIndex, 0, draggableId)
      state.data.columnOrder = newColumnOrder
    },
    idOfCardBeingMovedChanged: (state, action) => {
      const { id } = action.payload
      state.idOfCardBeingDragged = id
    },
    cardMovedWithinColumn: (state, action) => {
      const { draggableId, source, destination } = action.payload
      const startingColumn = state.data.columns[source.droppableId]
      const newCardIds = Array.from(startingColumn.cardIds) // Copy of cardIds
      // Move cardId from old index to new index
      newCardIds.splice(source.index, 1)
      newCardIds.splice(destination.index, 0, draggableId)
      const newColumn = {
        ...startingColumn,
        cardIds: newCardIds,
      }
      state.data.columns[newColumn.id] = newColumn
    },
    cardMovedAcrossColumns: (state, action) => {
      const { draggableId, source, destination } = action.payload
      const startingColumn = state.data.columns[source.droppableId]
      const endingColumn = state.data.columns[destination.droppableId]
      const startCardIds = Array.from(startingColumn.cardIds) // Copy of cardIds
      startCardIds.splice(source.index, 1)
      const newStartColumn = {
        ...startingColumn,
        cardIds: startCardIds,
      }
      const endCardIds = Array.from(endingColumn.cardIds)
      endCardIds.splice(destination.index, 0, draggableId)
      const newEndColumn = {
        ...endingColumn,
        cardIds: endCardIds,
      }
      state.data.columns[newStartColumn.id] = newStartColumn
      state.data.columns[newEndColumn.id] = newEndColumn
    },
    newTaskCardInitializationStarted: (state, action) => {
      const { columnId, newTaskCardId } = action.payload
      state.taskCardBeingInitializedInfo = {
        taskCardId: newTaskCardId,
        columnId: columnId,
      }
    },
    newTaskCardAdded: (state, action) => {
      if (!state.taskCardBeingInitializedInfo) return // This won't be null when the action is called. This line is just to silence TypeScript.
      const taskCardId = state.taskCardBeingInitializedInfo.taskCardId
      const { columnId, title, content } = action.payload
      const newTaskCard = {
        id: taskCardId,
        title: title,
        category: 'Default',
        content: content,
        checked: false,
        subTasks: [],
      }
      state.data.taskCards[taskCardId] = newTaskCard
      state.data.columns[columnId].cardIds.unshift(taskCardId)
      state.taskCardBeingInitializedInfo = null
    },
    newTaskCardInitializationCancelled: (state) => {
      state.taskCardBeingInitializedInfo = null
    },

    taskCardCheckedStatusChanged: (state, action) => {
      const { taskCardId, isChecked } = action.payload
      state.data.taskCards[taskCardId].checked = isChecked
    },
    taskCardTitleChanged: (state, action) => {
      const { taskCardId, newTitle } = action.payload
      state.data.taskCards[taskCardId].title = newTitle
    },
    taskCardContentChanged: (state, action) => {
      const { taskCardId, newContent } = action.payload
      state.data.taskCards[taskCardId].content = newContent
    },
    taskCardMovedToBottom: (state, action) => {
      const { columnId, taskCardIndex } = action.payload
      state.data.columns[columnId].cardIds.push(state.data.columns[columnId].cardIds.splice(taskCardIndex, 1)[0])
    },
    taskCardMovedToTop: (state, action) => {
      const { columnId, taskCardIndex } = action.payload
      state.data.columns[columnId].cardIds.unshift(state.data.columns[columnId].cardIds.splice(taskCardIndex, 1)[0])
    },
    taskCardDeleted: (state, action) => {
      const { columnId, taskCardId } = action.payload
      state.data.columns[columnId].cardIds = state.data.columns[columnId].cardIds.filter(
        (cardId) => cardId !== taskCardId
      )
      delete state.data.taskCards[taskCardId]
    },
    subTaskDragged: (state) => {
      state.isSubTaskBeingDragged = true
    },
    subTasksReordered: (state, action) => {
      const { draggableId, sourceIndex, destIndex } = action.payload
      const [taskCardId, subTaskId] = draggableId.split('~')
      const reorderedSubTasks = Array.from(state.data.taskCards[taskCardId].subTasks)
      reorderedSubTasks.splice(sourceIndex, 1)
      reorderedSubTasks.splice(destIndex, 0, subTaskId)
      state.data.taskCards[taskCardId].subTasks = reorderedSubTasks
      state.isSubTaskBeingDragged = false
    },
    subTasksCheckedStatusChanged: (state, action) => {
      const { subTaskId, isChecked } = action.payload
      state.data.subTasks[subTaskId].checked = isChecked
    },
    subTaskTitleChanged: (state, action) => {
      const { subTaskId, newTitle } = action.payload
      state.data.subTasks[subTaskId].title = newTitle
    },
    newSubTaskAddedOnEnterKeydown: (state, action) => {
      const { newSubTaskId, taskCardId, subTaskId } = action.payload
      const subTaskIds = state.data.taskCards[taskCardId].subTasks
      let subTaskIndex = subTaskIds.findIndex((id) => id === subTaskId)
      state.data.taskCards[taskCardId].subTasks.splice(subTaskIndex + 1, 0, newSubTaskId)
      state.data.subTasks[newSubTaskId] = {
        id: newSubTaskId,
        title: '',
        checked: false,
      }
    },
    newSubTaskAddedOnButtonClick: (state, action) => {
      const { taskCardId, newSubTaskId } = action.payload
      state.data.taskCards[taskCardId].subTasks.push(newSubTaskId)
      state.data.subTasks[newSubTaskId] = {
        id: newSubTaskId,
        title: '',
        checked: false,
      }
    },
    subTaskDeletedOnBackspaceKeydown: (state, action) => {
      const { taskCardId, subTaskId } = action.payload
      /* Moves cursor focus to subtask above using the subtask ID */
      const subTaskIds = state.data.taskCards[taskCardId].subTasks
      const subTaskIndex = subTaskIds.findIndex((id) => id === subTaskId)
      if (subTaskIndex > 0) {
        document.getElementById(subTaskIds[subTaskIndex - 1])?.focus()
      }
      /* -------------------------------------------------------- */
      delete state.data.subTasks[subTaskId]
      state.data.taskCards[taskCardId].subTasks = state.data.taskCards[taskCardId].subTasks.filter(
        (id) => id !== subTaskId
      )
    },
  },
})

export const {
  columnsReordered,
  idOfCardBeingMovedChanged,
  cardMovedWithinColumn,
  cardMovedAcrossColumns,
  newTaskCardInitializationStarted,
  newTaskCardInitializationCancelled,
  newTaskCardAdded,
  taskCardCheckedStatusChanged,
  taskCardTitleChanged,
  taskCardContentChanged,
  taskCardMovedToBottom,
  taskCardMovedToTop,
  taskCardDeleted,
  subTaskDragged,
  subTasksReordered,
  subTasksCheckedStatusChanged,
  subTaskTitleChanged,
  newSubTaskAddedOnEnterKeydown,
  newSubTaskAddedOnButtonClick,
  subTaskDeletedOnBackspaceKeydown,
} = plannerSlice.actions

export default plannerSlice.reducer
