import { TaskCardInfoType } from '@/hooks/Planner/types'
import axios from 'axios'
import { nanoid } from 'nanoid'
import { Dispatch } from 'react'

const addNewSubTask = async (
  taskCardId: string,
  newSubTaskId: string,
  newSubTasksOrder: string[],
  dispatch: Dispatch<any>,
  getToken: () => Promise<string | null>
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
  const token = await getToken()
  axios
    .post(
      `/api/planner/cards/${taskCardId}/subtasks`,
      {
        newSubTaskDetails,
        newSubTasksOrder,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .catch((error) => {
      dispatch({
        type: 'backendErrorOccurred',
      })
    })
}

export const addNewSubTaskToCardOnEnterKeydown = async (
  taskCard: TaskCardInfoType,
  existingSubTaskId: string,
  dispatch: Dispatch<any>,
  getToken: () => Promise<string | null>
) => {
  const newSubTaskId = nanoid()
  const newSubTasksOrder = Array.from(taskCard.subTasks)
  let subTaskIndex = newSubTasksOrder.findIndex((id: string) => id === existingSubTaskId)
  newSubTasksOrder.splice(subTaskIndex + 1, 0, newSubTaskId)
  addNewSubTask(taskCard.id, newSubTaskId, newSubTasksOrder, dispatch, getToken)
}

export const addNewSubTaskOnButtonClick = async (
  taskCard: TaskCardInfoType,
  dispatch: Dispatch<any>,
  getToken: () => Promise<string | null>
) => {
  const newSubTaskId = nanoid()
  const newSubTasksOrder = Array.from(taskCard.subTasks)
  newSubTasksOrder.push(newSubTaskId)
  addNewSubTask(taskCard.id, newSubTaskId, newSubTasksOrder, dispatch, getToken)
}
