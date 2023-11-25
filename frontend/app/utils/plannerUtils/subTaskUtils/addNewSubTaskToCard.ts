import { TaskCardInfoType } from '@/hooks/Planner/types'
import axios from 'axios'
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
  axios
    .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/cards/${taskCardId}/subtasks`, {
      newSubTaskDetails,
      newSubTasksOrder,
    })
    .catch((error) => showErrorBoundary(error))
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
