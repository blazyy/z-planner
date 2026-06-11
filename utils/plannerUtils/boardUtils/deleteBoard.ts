import axios from 'axios'
import { Dispatch } from 'react'
import { sendMutation } from '../apiClient'

export default function deleteBoard(boardId: string, dispatch: Dispatch<any>) {
  dispatch({
    type: 'boardDeleted',
    payload: {
      boardId,
    },
  })
  sendMutation(dispatch, () => axios.delete(`/api/planner/boards/${boardId}`))
}
