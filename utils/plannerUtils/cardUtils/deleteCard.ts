import axios from 'axios'
import { Dispatch } from 'react'
import { sendMutation } from '../apiClient'

export default function deleteCard(columnId: string, taskCardId: string, dispatch: Dispatch<any>) {
  dispatch({
    type: 'taskCardDeleted',
    payload: {
      columnId,
      taskCardId,
    },
  })
  sendMutation(dispatch, () => axios.delete(`/api/planner/columns/${columnId}/cards/${taskCardId}`))
}
