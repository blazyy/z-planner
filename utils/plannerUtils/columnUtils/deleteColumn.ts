import axios from 'axios'
import { Dispatch } from 'react'
import { sendMutation } from '../apiClient'

export default function deleteColumn(boardId: string, columnId: string, dispatch: Dispatch<any>) {
  dispatch({
    type: 'columnDeleted',
    payload: {
      boardId,
      columnId,
    },
  })
  sendMutation(dispatch, () => axios.delete(`/api/planner/boards/${boardId}/columns/${columnId}`))
}
