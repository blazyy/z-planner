import axios from 'axios'
import { Dispatch } from 'react'

export const changeCategoryInfo = async (
  categoryId: string,
  newName: string,
  newColor: string,
  dispatch: Dispatch<any>,
  getToken: () => Promise<string | null>
) => {
  const categoryDetails = {
    id: categoryId,
    name: newName,
    color: newColor,
  }
  dispatch({
    type: 'categoryInfoChanged',
    payload: {
      categoryDetails,
    },
  })
  const token = await getToken()
  axios
    .patch(
      `/api/planner/categories/${categoryId}`,
      {
        newName,
        newColor,
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
