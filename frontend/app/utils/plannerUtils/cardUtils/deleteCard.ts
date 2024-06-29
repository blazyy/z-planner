import axios from 'axios'
import { Dispatch } from 'react'

export default async function deleteCard(
  columnId: string,
  taskCardId: string,
  dispatch: Dispatch<any>,
  getToken: () => Promise<string | null>
) {
  dispatch({
    type: 'taskCardDeleted',
    payload: {
      columnId,
      taskCardId,
    },
  })
  const token = await getToken()

  axios
    .delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/columns/${columnId}/cards/${taskCardId}/delete`, {
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