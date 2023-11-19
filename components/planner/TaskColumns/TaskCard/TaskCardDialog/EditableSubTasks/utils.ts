import { getTotalSubTasksCount } from '../AddNewSubTaskButton'
import {
  HandleArrowDownFunc,
  HandleArrowUpFunc,
  HandleBackspaceFunc,
  HandleEnterFunc,
  HandleKeyDownOnSubTaskFunc,
} from './types'

const handleArrowDown: HandleArrowDownFunc = (data, taskCardId, subTask) => {
  /* Moves cursor focus to subtask below using the subtask ID */
  const subTaskIds = data.taskCards[taskCardId].subTasks
  const subTaskIndex = subTaskIds.findIndex((subTaskId) => subTaskId === subTask.id)
  if (subTaskIndex < subTaskIds.length - 1) {
    document.getElementById(subTaskIds[subTaskIndex + 1])?.focus()
  }
}

const handleArrowUp: HandleArrowUpFunc = (data, taskCardId, subTask) => {
  /* Moves cursor focus to subtask below using the subtask ID */
  const subTaskIds = data.taskCards[taskCardId].subTasks
  const subTaskIndex = subTaskIds.findIndex((subTaskId) => subTaskId === subTask.id)
  if (subTaskIndex > 0) {
    document.getElementById(subTaskIds[subTaskIndex - 1])?.focus()
  }
}

const handleBackspace: HandleBackspaceFunc = (event, plannerDispatch, taskCardId, subTask) => {
  event.preventDefault() // Prevents the last character of the task from being delete when the cursor jumps to the task above
  plannerDispatch!({
    type: 'subTaskDeletedOnBackspaceKeydown',
    payload: {
      taskCardId,
      subTaskId: subTask.id,
    },
  })
}

const handleEnter: HandleEnterFunc = (data, plannerDispatch, taskCardId, subTask) => {
  const numTotalNumSubTasks = getTotalSubTasksCount(data)
  const newSubTaskId: string = `$subtask-${numTotalNumSubTasks + 1}`
  plannerDispatch!({
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
  data,
  plannerDispatch,
  taskCardId,
  subTask
) => {
  if (event.key === 'ArrowDown') handleArrowDown(data, taskCardId, subTask)
  else if (event.key === 'ArrowUp') handleArrowUp(data, taskCardId, subTask)
  else if (event.key === 'Enter') handleEnter(data, plannerDispatch, taskCardId, subTask)
  else if (event.key === 'Backspace' && subTask.title === '')
    handleBackspace(event, plannerDispatch, taskCardId, subTask)
}
