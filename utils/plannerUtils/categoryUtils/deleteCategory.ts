import axios from 'axios'
import { Dispatch } from 'react'

export default async function deleteCategory(
  boardId: string,
  categoryId: string,
  dispatch: Dispatch<any>,
  getToken: () => Promise<string | null>
) {
  dispatch({
    type: 'categoryDeleted',
    payload: {
      boardId,
      categoryId,
    },
  })
  const token = await getToken()
  axios
    .delete(`/api/planner/boards/${boardId}/categories/${categoryId}`, {
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
