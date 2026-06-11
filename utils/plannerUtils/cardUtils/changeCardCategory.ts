import axios from 'axios'
import { Dispatch } from 'react'
import { sendMutation } from '../apiClient'

export default function changeCardCategory(taskCardId: string, newCategoryId: string, dispatch: Dispatch<any>) {
  dispatch({
    type: 'taskCategoryChanged',
    payload: {
      taskCardId,
      newCategoryId,
    },
  })
  sendMutation(dispatch, () => axios.patch(`/api/planner/cards/${taskCardId}`, { category: newCategoryId }))
}
