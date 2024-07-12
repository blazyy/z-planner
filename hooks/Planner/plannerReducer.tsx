import { UNASSIGNED_CATEGORY_ID } from '@/constants/constants'
import { Draft, produce } from 'immer'
import { PlannerType } from './types'

export const plannerReducer = produce((draft: Draft<PlannerType>, action) => {
  switch (action.type) {
    case 'dataFetchedFromDatabase': {
      return action.payload
    }
    case 'backendErrorOccurred': {
      draft.backendErrorOccurred = true
      break
    }
    case 'newBoardAdded': {
      const { boardId, boardName, unassignedCategoryDetails } = action.payload
      draft.boardOrder.push(boardId)
      draft.boards[boardId] = {
        id: boardId,
        name: boardName,
        columns: [],
        categories: [],
      }
      draft.boards[boardId].categories.push(unassignedCategoryDetails.id)
      draft.categories[unassignedCategoryDetails.id] = unassignedCategoryDetails
      break
    }
    case 'boardNameChanged': {
      const { boardId, newName } = action.payload
      draft.boards[boardId].name = newName
      break
    }
    case 'boardDeleted': {
      const { boardId } = action.payload
      delete draft.boards[boardId]
      draft.boardOrder = draft.boardOrder.filter((id: string) => id !== boardId)
      break
    }
    case 'newColumnAdded': {
      const { boardId, newColumnDetails, updatedColumns } = action.payload
      draft.boards[boardId].columns = updatedColumns
      draft.columns[newColumnDetails.id] = newColumnDetails
      break
    }
    case 'columnDeleted': {
      const { boardId, columnId } = action.payload
      draft.boards[boardId].columns = draft.boards[boardId].columns.filter((colId: string) => colId !== columnId)
      delete draft.columns[columnId]
      break
    }
    case 'columnNameChanged': {
      const { columnId, newName } = action.payload
      draft.columns[columnId].name = newName
      break
    }
    case 'columnsReordered': {
      const { boardId, newColumnOrder } = action.payload
      draft.boards[boardId].columns = newColumnOrder
      break
    }
    case 'cardMovedWithinColumn': {
      const { columnId, reorderedCardIds } = action.payload
      draft.columns[columnId].taskCards = reorderedCardIds
      break
    }
    case 'cardMovedAcrossColumns': {
      const { sourceColumnId, destColumnId, sourceColumnTaskCardIds, destColumnTaskCardIds } = action.payload
      draft.columns[sourceColumnId].taskCards = sourceColumnTaskCardIds
      draft.columns[destColumnId].taskCards = destColumnTaskCardIds
      break
    }
    case 'cardScheduledOnCalendar': {
      const { taskCardId } = action.payload
      if (draft.scheduledTaskCards.indexOf(taskCardId) === -1) draft.scheduledTaskCards.push(taskCardId)
      break
    }
    // NO NEED
    case 'idOfCardBeingDraggedChanged': {
      draft.idOfCardBeingDragged = action.payload
      break
    }
    // NO NEED
    case 'taskCardInitializationCancelled': {
      draft.taskCardBeingInitialized = null
      break
    }
    // NO NEED
    case 'newTaskCardInitialized': {
      draft.taskCardBeingInitialized = action.payload
      break
    }
    // NO NEED
    case 'taskCardBeingInitializedHighlightStatusChange': {
      draft.taskCardBeingInitialized!.isHighlighted = action.payload
      break
    }
    // NO NEED
    case 'dataEnteredInTaskCardBeingInitializedStatusChanged': {
      draft.dataEnteredInTaskCardBeingInitialized = action.payload
      break
    }
    case 'newTaskCardAdded': {
      const { columnId, newTaskCardDetails: newTaskCard, updatedTaskCards } = action.payload
      draft.taskCards[newTaskCard.id] = newTaskCard
      draft.columns[columnId].taskCards = updatedTaskCards
      draft.dataEnteredInTaskCardBeingInitialized = false
      draft.taskCardBeingInitialized = null
      break
    }
    case 'taskCardCheckedStatusChanged': {
      const { taskCardId, isChecked } = action.payload
      draft.taskCards[taskCardId].checked = isChecked
      break
    }
    case 'taskCardTitleChanged': {
      const { taskCardId, newTitle } = action.payload
      draft.taskCards[taskCardId].title = newTitle
      break
    }
    case 'taskCardContentChanged': {
      const { taskCardId, newContent } = action.payload
      draft.taskCards[taskCardId].content = newContent
      break
    }
    case 'taskCardDeleted': {
      const { columnId, taskCardId } = action.payload
      draft.columns[columnId].taskCards = draft.columns[columnId].taskCards.filter(
        (cardId: string) => cardId !== taskCardId
      )
      delete draft.taskCards[taskCardId]
      break
    }
    // NO NEED
    case 'subTaskDragStatusChanged': {
      draft.isSubTaskBeingDragged = action.payload
      break
    }
    case 'subTasksReordered': {
      const { taskCardId, reorderedSubTasks } = action.payload
      draft.taskCards[taskCardId].subTasks = reorderedSubTasks
      break
    }
    case 'subTasksCheckedStatusChanged': {
      const { subTaskId, isChecked } = action.payload
      draft.subTasks[subTaskId].checked = isChecked
      break
    }
    case 'subTaskTitleChanged': {
      const { subTaskId, newTitle } = action.payload
      draft.subTasks[subTaskId].title = newTitle
      break
    }
    case 'newSubTaskAdded': {
      const { taskCardId, newSubTaskDetails, newSubTasksOrder } = action.payload
      draft.taskCards[taskCardId].subTasks = newSubTasksOrder
      draft.subTasks[newSubTaskDetails.id] = newSubTaskDetails
      break
    }
    case 'subTaskDeletedOnBackspaceKeydown': {
      const { taskCardId, subTaskId, newSubtasks } = action.payload
      draft.taskCards[taskCardId].subTasks = newSubtasks
      delete draft.subTasks[subTaskId]
      break
    }
    case 'taskCategoryChanged': {
      const { taskCardId, newCategoryId } = action.payload
      draft.taskCards[taskCardId].category = newCategoryId
      break
    }
    case 'newCategoryAdded': {
      const { boardId, newCategoryDetails } = action.payload
      draft.boards[boardId].categories.push(newCategoryDetails.id)
      draft.categories[newCategoryDetails.id] = newCategoryDetails
      break
    }
    case 'categoryInfoChanged': {
      const { categoryDetails } = action.payload
      draft.categories[categoryDetails.id] = categoryDetails
      break
    }
    case 'categoryDeleted': {
      const { boardId, categoryId } = action.payload
      for (const taskCardId in draft.taskCards) {
        if (draft.taskCards[taskCardId].category === categoryId) {
          draft.taskCards[taskCardId].category = UNASSIGNED_CATEGORY_ID
        }
      }
      draft.boards[boardId].categories = draft.boards[boardId].categories.filter((catId: string) => {
        return catId !== categoryId
      })
      delete draft.categories[categoryId]
      break
    }
  }
})
