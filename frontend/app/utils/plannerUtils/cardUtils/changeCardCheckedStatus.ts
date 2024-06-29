import axios from 'axios'
import { Dispatch } from 'react'

export default async function changeCardCheckedStatus(
  taskCardId: string,
  isChecked: boolean,
  dispatch: Dispatch<any>,
  getToken: () => Promise<string | null>
) {
  dispatch({
    type: 'taskCardCheckedStatusChanged',
    payload: {
      taskCardId,
      isChecked,
    },
  })
  const token = await getToken()
  axios
    .patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/cards/${taskCardId}/checked`,
      {
        isChecked,
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
