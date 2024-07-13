import axios from 'axios'
import { Dispatch } from 'react'

export const addNewCategory = async (
  boardId: string,
  newCategoryDetails: {
    id: string
    name: string
    color: string
  },
  dispatch: Dispatch<any>,
  getToken: () => Promise<string | null>
) => {
  dispatch({
    type: 'newCategoryAdded',
    payload: {
      boardId,
      newCategoryDetails,
    },
  })
  const token = await getToken()
  axios
    .post(
      `/api/planner/boards/${boardId}/categories`,
      {
        newCategoryDetails,
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
