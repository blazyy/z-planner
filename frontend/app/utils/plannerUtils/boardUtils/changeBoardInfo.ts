import axios from 'axios'
import { Dispatch } from 'react'

export const changeBoardInfo = async (
  boardId: string,
  newName: string,
  dispatch: Dispatch<any>,
  getToken: () => Promise<string | null>
) => {
  dispatch({
    type: 'boardNameChanged',
    payload: {
      boardId,
      newName,
    },
  })
  const token = await getToken()
  axios
    .patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/boards/${boardId}`,
      {
        newName,
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
