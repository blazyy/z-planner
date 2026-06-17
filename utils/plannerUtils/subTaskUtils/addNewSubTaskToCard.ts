import axios from 'axios'

import { NANOID } from '@/constants/constants'
import { TaskCardInfoType } from '@/hooks/Planner/types'
import { PlannerDispatchContextType } from '@/hooks/Planner/types'

import { sendMutation } from '../apiClient'

const addNewSubTask = (
  taskCardId: string,
  newSubTaskId: string,
  newSubTasksOrder: string[],
  dispatch: PlannerDispatchContextType
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
  sendMutation(dispatch, () =>
    axios.post(`/api/planner/cards/${taskCardId}/subtasks`, {
      newSubTaskDetails,
      newSubTasksOrder,
    })
  )
}

export const addNewSubTaskToCardOnEnterKeydown = (
  taskCard: TaskCardInfoType,
  existingSubTaskId: string,
  dispatch: PlannerDispatchContextType
) => {
  const newSubTaskId = NANOID()
  const newSubTasksOrder = Array.from(taskCard.subTasks)
  const subTaskIndex = newSubTasksOrder.findIndex((id: string) => id === existingSubTaskId)
  newSubTasksOrder.splice(subTaskIndex + 1, 0, newSubTaskId)
  addNewSubTask(taskCard.id, newSubTaskId, newSubTasksOrder, dispatch)
}

export const addNewSubTaskOnButtonClick = (taskCard: TaskCardInfoType, dispatch: PlannerDispatchContextType) => {
  const newSubTaskId = NANOID()
  const newSubTasksOrder = Array.from(taskCard.subTasks)
  newSubTasksOrder.push(newSubTaskId)
  addNewSubTask(taskCard.id, newSubTaskId, newSubTasksOrder, dispatch)
}
