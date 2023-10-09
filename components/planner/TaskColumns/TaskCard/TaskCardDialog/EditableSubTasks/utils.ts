import { newSubTaskAddedOnEnterKeydown, subTaskDeletedOnBackspaceKeydown } from '@/app/store/planner/reducer'
import { AppDispatch } from '@/app/store/store'
import { PlannerDataType } from '@/components/planner/Planner'
import { SubTaskInfoType } from '../../../TaskColumn'
import { getTotalSubTasksCount } from '../AddNewSubTaskButton'

type HandleKeyDownOnSubTaskFunc = (
  event: React.KeyboardEvent<HTMLInputElement>,
  data: PlannerDataType,
  dispatch: AppDispatch,
  taskCardId: string,
  subTask: SubTaskInfoType
) => void

type HandleArrowDownFunc = (data: PlannerDataType, taskCardId: string, subTask: SubTaskInfoType) => void

type HandleArrowUpFunc = (data: PlannerDataType, taskCardId: string, subTask: SubTaskInfoType) => void

type HandleBackspaceFunc = (
  event: React.KeyboardEvent<HTMLInputElement>,
  dispatch: AppDispatch,
  taskCardId: string,
  subTask: SubTaskInfoType
) => void

type HandleEnterFunc = (
  data: PlannerDataType,
  dispatch: AppDispatch,
  taskCardId: string,
  subTask: SubTaskInfoType
) => void

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

const handleBackspace: HandleBackspaceFunc = (event, dispatch, taskCardId, subTask) => {
  event.preventDefault() // Prevents the last character of the task from being delete when the cursor jumps to the task above
  dispatch(
    subTaskDeletedOnBackspaceKeydown({
      taskCardId,
      subTaskId: subTask.id,
    })
  )
}

const handleEnter: HandleEnterFunc = (data, dispatch, taskCardId, subTask) => {
  const numTotalNumSubTasks = getTotalSubTasksCount(data)
  const newSubTaskId: string = `$subtask-${numTotalNumSubTasks + 1}`
  dispatch(
    newSubTaskAddedOnEnterKeydown({
      newSubTaskId,
      taskCardId,
      subTaskId: subTask.id,
    })
  )
}

export const handleKeyDownOnSubTask: HandleKeyDownOnSubTaskFunc = (event, data, dispatch, taskCardId, subTask) => {
  if (event.key === 'ArrowDown') handleArrowDown(data, taskCardId, subTask)
  else if (event.key === 'ArrowUp') handleArrowUp(data, taskCardId, subTask)
  else if (event.key === 'Enter') handleEnter(data, dispatch, taskCardId, subTask)
  else if (event.key === 'Backspace' && subTask.title === '') handleBackspace(event, dispatch, taskCardId, subTask)
}
