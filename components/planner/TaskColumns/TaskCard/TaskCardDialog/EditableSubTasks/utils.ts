import { getTotalSubTasksCount } from '../AddNewSubTaskButton'
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

const handleBackspace: HandleBackspaceFunc = (event, dispatch, taskCardId, subTask) => {
  event.preventDefault() // Prevents the last character of the task from being delete when the cursor jumps to the task above
  dispatch!({
    type: 'subTaskDeletedOnBackspaceKeydown',
    payload: {
      taskCardId,
      subTaskId: subTask.id,
    },
  })
}

const handleEnter: HandleEnterFunc = (subTasks, dispatch, taskCardId, subTask) => {
  const numTotalNumSubTasks = getTotalSubTasksCount(subTasks)
  const newSubTaskId: string = `$subtask-${numTotalNumSubTasks + 1}`
  dispatch!({
    type: 'newSubTaskAddedOnEnterKeydown',
    payload: {
      newSubTaskId,
      taskCardId,
      subTaskId: subTask.id,
    },
  })
}

export const handleKeyDownOnSubTask: HandleKeyDownOnSubTaskFunc = (
  event,
  taskCards,
  subTasks,
  dispatch,
  taskCardId,
  subTask
) => {
  if (event.key === 'ArrowDown') handleArrowDown(taskCards, taskCardId, subTask)
  else if (event.key === 'ArrowUp') handleArrowUp(taskCards, taskCardId, subTask)
  else if (event.key === 'Enter') handleEnter(subTasks, dispatch, taskCardId, subTask)
  else if (event.key === 'Backspace' && subTask.title === '') handleBackspace(event, dispatch, taskCardId, subTask)
}
