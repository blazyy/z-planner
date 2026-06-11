import axios from 'axios'
import { Dispatch } from 'react'
import { sendMutation } from '../apiClient'

export const changeBoardInfo = (boardId: string, newName: string, dispatch: Dispatch<any>) => {
  dispatch({
    type: 'boardNameChanged',
    payload: {
      boardId,
      newName,
    },
  })
  sendMutation(dispatch, () => axios.patch(`/api/planner/boards/${boardId}`, { newName }))
}
