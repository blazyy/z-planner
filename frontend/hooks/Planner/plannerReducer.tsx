import { Draft, produce } from 'immer'
import { PlannerType } from './types'

export const plannerReducer = produce((draft: Draft<PlannerType>, action) => {
  switch (action.type) {
    // DONE
    case 'dataFetchedFromDatabase': {
      return action.payload
    }
    // DONE
    case 'isManagingBoard': {
      draft.currentView = 'board'
      break
    }
    // DONE
    case 'isManagingCategories': {
      draft.currentView = 'manageCategories'
      break
    }
    // DONE
    case 'selectedBoardChanged': {
      draft.selectedBoard = action.payload.boardId
      draft.currentView = 'board'
      break
    }
    case 'newBoardAdded': {
      const { newBoardOrder, newBoardDetails } = action.payload
      draft.boardOrder = newBoardOrder
      draft.boards[newBoardDetails.id] = newBoardDetails
      break
    }
    // DONE
    case 'newColumnAdded': {
      const { boardId, newColumnDetails, updatedColumns } = action.payload
      draft.boards[boardId].columns = updatedColumns
      draft.columns[newColumnDetails.id] = newColumnDetails
      break
    }
    // DONE
    case 'columnDeleted': {
      const { boardId, columnId } = action.payload
      draft.boards[boardId].columns = draft.boards[boardId].columns.filter((colId: string) => colId !== columnId)
      delete draft.columns[columnId]
      break
    }
    // DONE
    case 'columnsReordered': {
      const { boardId, newColumnOrder } = action.payload
      draft.boards[boardId].columns = newColumnOrder
      break
    }
    // DONE
    case 'cardMovedWithinColumn': {
      const { columnId, reorderedCardIds } = action.payload
      draft.columns[columnId].taskCards = reorderedCardIds
      break
    }
    // DONE
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
    // DONE
    case 'newTaskCardAdded': {
      const { columnId, newTaskCardDetails: newTaskCard, updatedTaskCards } = action.payload
      draft.taskCards[newTaskCard.id] = newTaskCard
      draft.columns[columnId].taskCards = updatedTaskCards
      draft.dataEnteredInTaskCardBeingInitialized = false
      draft.taskCardBeingInitialized = null
      break
    }
    // DONE
    case 'taskCardCheckedStatusChanged': {
      const { taskCardId, isChecked } = action.payload
      draft.taskCards[taskCardId].checked = isChecked
      break
    }
    // DONE
    case 'taskCardTitleChanged': {
      const { taskCardId, newTitle } = action.payload
      draft.taskCards[taskCardId].title = newTitle
      break
    }
    // DONE
    case 'taskCardContentChanged': {
      const { taskCardId, newContent } = action.payload
      draft.taskCards[taskCardId].content = newContent
      break
    }
    // DONE
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
    // DONE
    case 'subTasksReordered': {
      const { taskCardId, reorderedSubTasks } = action.payload
      draft.taskCards[taskCardId].subTasks = reorderedSubTasks
      break
    }
    // DONE
    case 'subTasksCheckedStatusChanged': {
      const { subTaskId, isChecked } = action.payload
      draft.subTasks[subTaskId].checked = isChecked
      break
    }
    // DONE
    case 'subTaskTitleChanged': {
      const { subTaskId, newTitle } = action.payload
      draft.subTasks[subTaskId].title = newTitle
      break
    }
    // DONE
    case 'newSubTaskAdded': {
      const { taskCardId, newSubTaskDetails, newSubTasksOrder } = action.payload
      draft.taskCards[taskCardId].subTasks = newSubTasksOrder
      draft.subTasks[newSubTaskDetails.id] = newSubTaskDetails
      break
    }
    // DONE
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
    case 'categoryInfoChanged': {
      const { categoryId, newName, newColor } = action.payload
      draft.categories[categoryId] = {
        name: newName,
        color: newColor,
      }
      break
    }
  }
})
