import axios from 'axios'
import { Dispatch } from 'react'

export default async function deleteColumn(
  boardId: string,
  columnId: string,
  dispatch: Dispatch<any>,
  getToken: () => Promise<string | null>
) {
  dispatch({
    type: 'columnDeleted',
    payload: {
      boardId,
      columnId,
    },
  })
  const token = await getToken()

  axios
    .delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/boards/${boardId}/columns/${columnId}/delete`, {
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
