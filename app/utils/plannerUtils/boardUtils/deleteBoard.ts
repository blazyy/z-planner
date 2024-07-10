import axios from 'axios'
import { Dispatch } from 'react'

export default async function deleteBoard(
  boardId: string,
  dispatch: Dispatch<any>,
  getToken: () => Promise<string | null>
) {
  dispatch({
    type: 'boardDeleted',
    payload: {
      boardId,
    },
  })
  const token = await getToken()
  axios
    .delete(`/api/planner/boards/${boardId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch((error) => {
      dispatch({
        type: 'backendErrorOccurred',
      })
    })
}
