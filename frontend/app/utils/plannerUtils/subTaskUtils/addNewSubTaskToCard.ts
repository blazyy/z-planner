import { TaskCardInfoType } from '@/hooks/Planner/types'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

const addNewSubTask = async (
  taskCardId: string,
  newSubTaskId: string,
  newSubTasksOrder: string[],
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) => {
  const newSubTaskDetails = {
    id: newSubTaskId,
    title: '',
    checked: false,
  }
  dispatch({
    type: 'newSubTaskAdded',
    payload: {
      taskCardId,
      newSubTaskDetails,
      newSubTasksOrder,
    },
  })
}

export const addNewSubTaskToCardOnEnterKeydown = async (
  taskCard: TaskCardInfoType,
  existingSubTaskId: string,
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) => {
  const newSubTaskId = crypto.randomUUID()
  const newSubTasksOrder = Array.from(taskCard.subTasks)
  let subTaskIndex = newSubTasksOrder.findIndex((id: string) => id === existingSubTaskId)
  newSubTasksOrder.splice(subTaskIndex + 1, 0, newSubTaskId)
  addNewSubTask(taskCard.id, newSubTaskId, newSubTasksOrder, dispatch, showErrorBoundary)
}

export const addNewSubTaskOnButtonClick = async (
  taskCard: TaskCardInfoType,
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) => {
  const newSubTaskId = crypto.randomUUID()
  const newSubTasksOrder = Array.from(taskCard.subTasks)
  newSubTasksOrder.push(newSubTaskId)
  addNewSubTask(taskCard.id, newSubTaskId, newSubTasksOrder, dispatch, showErrorBoundary)
}

// case 'newSubTaskAddedOnEnterKeydown': {
//   const { newSubTaskId, taskCardId, subTaskId } = action.payload
//   const subTaskIds = draft.taskCards[taskCardId].subTasks
//   let subTaskIndex = subTaskIds.findIndex((id: string) => id === subTaskId)
//   draft.taskCards[taskCardId].subTasks.splice(subTaskIndex + 1, 0, newSubTaskId)
//   draft.subTasks[newSubTaskId] = {
//     id: newSubTaskId,
//     title: '',
//     checked: false,
//   }
//   break
// }

// case 'newSubTaskAddedOnButtonClick': {
//   const { taskCardId, newSubTaskId } = action.payload
//   draft.taskCards[taskCardId].subTasks.push(newSubTaskId)
//   draft.subTasks[newSubTaskId] = {
//     id: newSubTaskId,
//     title: '',
//     checked: false,
//   }
//   break
// }
