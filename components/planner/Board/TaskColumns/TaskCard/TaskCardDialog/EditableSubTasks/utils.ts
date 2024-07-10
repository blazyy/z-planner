import { addNewSubTaskToCardOnEnterKeydown } from '@/app/utils/plannerUtils/subTaskUtils/addNewSubTaskToCard'
import deleteSubTask from '@/app/utils/plannerUtils/subTaskUtils/deleteSubTask'
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

const handleBackspace: HandleBackspaceFunc = (taskCard, subTaskId, event, dispatch, getToken) => {
  event.preventDefault() // Prevents the last character of the task from being delete when the cursor jumps to the task above
  deleteSubTask(taskCard, subTaskId, dispatch, getToken)
}

const handleEnter: HandleEnterFunc = (taskCards, taskCardId, subTask, dispatch, getToken) => {
  addNewSubTaskToCardOnEnterKeydown(taskCards[taskCardId], subTask.id, dispatch, getToken)
}

export const handleKeyDownOnSubTask: HandleKeyDownOnSubTaskFunc = (
  taskCards,
  subTasks,
  taskCardId,
  subTask,
  event,
  dispatch,
  getToken
) => {
  if (event.key === 'ArrowDown') handleArrowDown(taskCards, taskCardId, subTask)
  else if (event.key === 'ArrowUp') handleArrowUp(taskCards, taskCardId, subTask)
  else if (event.key === 'Enter') handleEnter(taskCards, taskCardId, subTask, dispatch, getToken)
  else if (event.key === 'Backspace' && subTask.title === '')
    handleBackspace(taskCards[taskCardId], subTask.id, event, dispatch, getToken)
}
