import { Draft, produce } from 'immer'
import { PlannerType } from './types'

export const plannerReducer = produce((draft: Draft<PlannerType>, action) => {
  switch (action.type) {
    case 'dataFetchedFromDatabase': {
      return action.payload
    }
    case 'newBoardAdded': {
      const { boardId, boardName } = action.payload
      draft.boardOrder.push(boardId)
      draft.boards[boardId] = {
        id: boardId,
        name: boardName,
        columns: [],
      }
      break
    }
    case 'subTaskDragStatusChanged': {
      draft.isSubTaskBeingDragged = action.payload
      break
    }
    case 'columnsReordered': {
      const { draggableId, sourceIndex, destIndex, boardId } = action.payload
      const newColumnOrder = Array.from(draft.boards[boardId].columns)
      newColumnOrder.splice(sourceIndex, 1)
      newColumnOrder.splice(destIndex, 0, draggableId)
      draft.boards[boardId].columns = newColumnOrder
      break
    }
    case 'cardMovedWithinColumn': {
      const { draggableId, source, destination } = action.payload
      const startingColumn = draft.columns[source.droppableId]
      const newCardIds = Array.from(startingColumn.taskCards) // Copy of taskCards

      // Move cardId from old index to new index
      newCardIds.splice(source.index, 1)
      newCardIds.splice(destination.index, 0, draggableId)
      const newColumn = {
        ...startingColumn,
        taskCards: newCardIds,
      }
      draft.columns[newColumn.id] = newColumn
      break
    }
    case 'cardMovedAcrossColumns': {
      const { draggableId, source, destination } = action.payload
      const startingColumn = draft.columns[source.droppableId]
      const endingColumn = draft.columns[destination.droppableId]
      const startCardIds = Array.from(startingColumn.taskCards) // Copy of taskCards
      startCardIds.splice(source.index, 1)
      const newStartColumn = {
        ...startingColumn,
        taskCards: startCardIds,
      }
      const endCardIds = Array.from(endingColumn.taskCards)
      endCardIds.splice(destination.index, 0, draggableId)
      const newEndColumn = {
        ...endingColumn,
        taskCards: endCardIds,
      }
      draft.columns[newStartColumn.id] = newStartColumn
      draft.columns[newEndColumn.id] = newEndColumn
      break
    }
    case 'idOfCardBeingDraggedChanged': {
      draft.idOfCardBeingDragged = action.payload
      break
    }
    case 'taskCardInitializationCancelled': {
      draft.taskCardBeingInitialized = null
      break
    }
    case 'newTaskCardInitialized': {
      draft.taskCardBeingInitialized = action.payload
      break
    }
    case 'taskCardBeingInitializedHighlightStatusChange': {
      draft.taskCardBeingInitialized!.isHighlighted = action.payload
      break
    }
    case 'dataEnteredInTaskCardBeingInitializedStatusChanged': {
      draft.dataEnteredInTaskCardBeingInitialized = action.payload
      break
    }
    case 'newTaskCardAdded': {
      const { columnId, taskCardId, title, content, category } = action.payload
      const newTaskCard = {
        id: taskCardId,
        title: title,
        category: category,
        content: content,
        checked: false,
        subTasks: [],
      }
      draft.taskCards[taskCardId] = newTaskCard
      draft.columns[columnId].taskCards.unshift(taskCardId)
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
    case 'taskCardMovedToBottom': {
      const { columnId, taskCardIndex } = action.payload
      draft.columns[columnId].taskCards.push(draft.columns[columnId].taskCards.splice(taskCardIndex, 1)[0])
      break
    }
    case 'taskCardMovedToTop': {
      const { columnId, taskCardIndex } = action.payload
      draft.columns[columnId].taskCards.unshift(draft.columns[columnId].taskCards.splice(taskCardIndex, 1)[0])
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
    case 'subTasksReordered': {
      const { draggableId, sourceIndex, destIndex } = action.payload
      const [taskCardId, subTaskId] = draggableId.split('~')
      const reorderedSubTasks = Array.from(draft.taskCards[taskCardId].subTasks)
      reorderedSubTasks.splice(sourceIndex, 1)
      reorderedSubTasks.splice(destIndex, 0, subTaskId)
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
    case 'newSubTaskAddedOnEnterKeydown': {
      const { newSubTaskId, taskCardId, subTaskId } = action.payload
      const subTaskIds = draft.taskCards[taskCardId].subTasks
      let subTaskIndex = subTaskIds.findIndex((id: string) => id === subTaskId)
      draft.taskCards[taskCardId].subTasks.splice(subTaskIndex + 1, 0, newSubTaskId)
      draft.subTasks[newSubTaskId] = {
        id: newSubTaskId,
        title: '',
        checked: false,
      }
      break
    }

    case 'newSubTaskAddedOnButtonClick': {
      const { taskCardId, newSubTaskId } = action.payload
      draft.taskCards[taskCardId].subTasks.push(newSubTaskId)
      draft.subTasks[newSubTaskId] = {
        id: newSubTaskId,
        title: '',
        checked: false,
      }
      break
    }
    case 'subTaskDeletedOnBackspaceKeydown': {
      const { taskCardId, subTaskId } = action.payload
      /* Moves cursor focus to subtask above using the subtask ID */
      const subTaskIds = draft.taskCards[taskCardId].subTasks
      const subTaskIndex = subTaskIds.findIndex((id: string) => id === subTaskId)
      if (subTaskIndex > 0) {
        document.getElementById(subTaskIds[subTaskIndex - 1])?.focus()
      }
      /* -------------------------------------------------------- */
      delete draft.subTasks[subTaskId]
      draft.taskCards[taskCardId].subTasks = draft.taskCards[taskCardId].subTasks.filter(
        (id: string) => id !== subTaskId
      )
      break
    }
    case 'taskCategoryChanged': {
      const { taskCardId, chosenCategory } = action.payload
      draft.taskCards[taskCardId].category = chosenCategory
      break
    }
  }
})
