import { addNewSubTaskToCardOnEnterKeydown } from '@/utils/plannerUtils/subTaskUtils/addNewSubTaskToCard'
import deleteSubTask from '@/utils/plannerUtils/subTaskUtils/deleteSubTask'

import {
  HandleArrowDownFunc,
  HandleArrowUpFunc,
  HandleBackspaceFunc,
  HandleEnterFunc,
  HandleKeyDownOnSubTaskFunc,
} from './types'

const handleArrowDown: HandleArrowDownFunc = (taskCards, taskCardId, subTask) => {
  /* Moves cursor focus to subtask below using the subtask ID */
  const subTaskIds = taskCards[taskCardId].subTasks
  const subTaskIndex = subTaskIds.findIndex((subTaskId) => subTaskId === subTask.id)
  if (subTaskIndex < subTaskIds.length - 1) {
    document.getElementById(subTaskIds[subTaskIndex + 1])?.focus()
  }
}

const handleArrowUp: HandleArrowUpFunc = (taskCards, taskCardId, subTask) => {
  /* Moves cursor focus to subtask below using the subtask ID */
  const subTaskIds = taskCards[taskCardId].subTasks
  const subTaskIndex = subTaskIds.findIndex((subTaskId) => subTaskId === subTask.id)
  if (subTaskIndex > 0) {
    document.getElementById(subTaskIds[subTaskIndex - 1])?.focus()
  }
}

const handleBackspace: HandleBackspaceFunc = (taskCard, subTaskId, event, dispatch, boardId) => {
  event.preventDefault() // Prevents the last character of the task from being delete when the cursor jumps to the task above
  deleteSubTask(taskCard, subTaskId, dispatch, boardId)
}

const handleEnter: HandleEnterFunc = (taskCards, taskCardId, subTask, dispatch, boardId) => {
  addNewSubTaskToCardOnEnterKeydown(taskCards[taskCardId], subTask.id, dispatch, boardId)
}

export const handleKeyDownOnSubTask: HandleKeyDownOnSubTaskFunc = (
  taskCards,
  subTasks,
  taskCardId,
  subTask,
  event,
  dispatch,
  boardId
) => {
  if (event.key === 'ArrowDown') handleArrowDown(taskCards, taskCardId, subTask)
  else if (event.key === 'ArrowUp') handleArrowUp(taskCards, taskCardId, subTask)
  else if (event.key === 'Enter') handleEnter(taskCards, taskCardId, subTask, dispatch, boardId)
  else if (event.key === 'Backspace' && subTask.title === '')
    handleBackspace(taskCards[taskCardId], subTask.id, event, dispatch, boardId)
}
