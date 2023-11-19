import { produce } from 'immer'

export const plannerReducer = produce((draft, action) => {
  switch (action.type) {
    case 'subTaskDragStatusChanged': {
      draft.isSubTaskBeingDragged = action.payload
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
      draft.taskCardBeingInitialized.isHighlighted = action.payload
      break
    }
    case 'dataEnteredInTaskCardBeingInitializedStatusChanged': {
      draft.dataEnteredInTaskCardBeingInitialized = action.payload
      break
    }
    case 'columnsReordered': {
      const { draggableId, sourceIndex, destIndex } = action.payload
      const newColumnOrder = Array.from(draft.data.columnOrder)
      newColumnOrder.splice(sourceIndex, 1)
      newColumnOrder.splice(destIndex, 0, draggableId)
      draft.data.columnOrder = newColumnOrder
      break
    }
    case 'cardMovedWithinColumn': {
      const { draggableId, source, destination } = action.payload
      const startingColumn = draft.data.columns[source.droppableId]
      const newCardIds = Array.from(startingColumn.cardIds) // Copy of cardIds

      // Move cardId from old index to new index
      newCardIds.splice(source.index, 1)
      newCardIds.splice(destination.index, 0, draggableId)
      const newColumn = {
        ...startingColumn,
        cardIds: newCardIds,
      }
      draft.data.columns[newColumn.id] = newColumn
      break
    }
    case 'cardMovedAcrossColumns': {
      const { draggableId, source, destination } = action.payload
      const startingColumn = draft.data.columns[source.droppableId]
      const endingColumn = draft.data.columns[destination.droppableId]
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
      draft.data.columns[newStartColumn.id] = newStartColumn
      draft.data.columns[newEndColumn.id] = newEndColumn
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
      draft.data.taskCards[taskCardId] = newTaskCard
      draft.data.columns[columnId].cardIds.unshift(taskCardId)
      break
    }
    case 'taskCardCheckedStatusChanged': {
      const { taskCardId, isChecked } = action.payload
      draft.data.taskCards[taskCardId].checked = isChecked
      break
    }
    case 'taskCardTitleChanged': {
      const { taskCardId, newTitle } = action.payload
      draft.data.taskCards[taskCardId].title = newTitle
      break
    }
    case 'taskCardContentChanged': {
      const { taskCardId, newContent } = action.payload
      draft.data.taskCards[taskCardId].content = newContent
      break
    }
    case 'taskCardMovedToBottom': {
      const { columnId, taskCardIndex } = action.payload
      draft.data.columns[columnId].cardIds.push(draft.data.columns[columnId].cardIds.splice(taskCardIndex, 1)[0])
      break
    }
    case 'taskCardMovedToTop': {
      const { columnId, taskCardIndex } = action.payload
      draft.data.columns[columnId].cardIds.unshift(draft.data.columns[columnId].cardIds.splice(taskCardIndex, 1)[0])
      break
    }
    case 'taskCardDeleted': {
      const { columnId, taskCardId } = action.payload
      draft.data.columns[columnId].cardIds = draft.data.columns[columnId].cardIds.filter(
        (cardId: string) => cardId !== taskCardId
      )
      delete draft.data.taskCards[taskCardId]
      break
    }
    case 'subTasksReordered': {
      const { draggableId, sourceIndex, destIndex } = action.payload
      const [taskCardId, subTaskId] = draggableId.split('~')
      const reorderedSubTasks = Array.from(draft.data.taskCards[taskCardId].subTasks)
      reorderedSubTasks.splice(sourceIndex, 1)
      reorderedSubTasks.splice(destIndex, 0, subTaskId)
      draft.data.taskCards[taskCardId].subTasks = reorderedSubTasks
      break
    }
    case 'subTasksCheckedStatusChanged': {
      const { subTaskId, isChecked } = action.payload
      draft.data.subTasks[subTaskId].checked = isChecked
      break
    }
    case 'subTaskTitleChanged': {
      const { subTaskId, newTitle } = action.payload
      draft.data.subTasks[subTaskId].title = newTitle
      break
    }
    case 'newSubTaskAddedOnEnterKeydown': {
      const { newSubTaskId, taskCardId, subTaskId } = action.payload
      const subTaskIds = draft.data.taskCards[taskCardId].subTasks
      let subTaskIndex = subTaskIds.findIndex((id: string) => id === subTaskId)
      draft.data.taskCards[taskCardId].subTasks.splice(subTaskIndex + 1, 0, newSubTaskId)
      draft.data.subTasks[newSubTaskId] = {
        id: newSubTaskId,
        title: '',
        checked: false,
      }
      break
    }

    case 'newSubTaskAddedOnButtonClick': {
      const { taskCardId, newSubTaskId } = action.payload
      draft.data.taskCards[taskCardId].subTasks.push(newSubTaskId)
      draft.data.subTasks[newSubTaskId] = {
        id: newSubTaskId,
        title: '',
        checked: false,
      }
      break
    }
    case 'subTaskDeletedOnBackspaceKeydown': {
      const { taskCardId, subTaskId } = action.payload
      /* Moves cursor focus to subtask above using the subtask ID */
      const subTaskIds = draft.data.taskCards[taskCardId].subTasks
      const subTaskIndex = subTaskIds.findIndex((id: string) => id === subTaskId)
      if (subTaskIndex > 0) {
        document.getElementById(subTaskIds[subTaskIndex - 1])?.focus()
      }
      /* -------------------------------------------------------- */
      delete draft.data.subTasks[subTaskId]
      draft.data.taskCards[taskCardId].subTasks = draft.data.taskCards[taskCardId].subTasks.filter(
        (id: string) => id !== subTaskId
      )
      break
    }
    case 'taskCategoryChanged': {
      const { taskCardId, chosenCategory } = action.payload
      draft.data.taskCards[taskCardId].category = chosenCategory
      break
    }
  }
})
