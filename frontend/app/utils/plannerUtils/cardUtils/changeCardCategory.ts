import axios from 'axios'
import { Dispatch } from 'react'

export default async function changeCardCategory(
  taskCardId: string,
  newCategoryId: string,
  dispatch: Dispatch<any>,
  getToken: () => Promise<string | null>
) {
  dispatch({
    type: 'taskCategoryChanged',
    payload: {
      taskCardId,
      newCategoryId,
    },
  })
  const token = await getToken()
  axios
    .patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/cards/${taskCardId}/category`,
      {
        newCategoryId,
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
