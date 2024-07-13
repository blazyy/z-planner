import axios from 'axios'
import { Dispatch } from 'react'

export default async function changeCardCheckedStatus(
  columnId: string,
  taskCardId: string,
  isChecked: boolean,
  dispatch: Dispatch<any>,
  getToken: () => Promise<string | null>
) {
  dispatch({
    type: 'taskCardCheckedStatusChanged',
    payload: {
      columnId,
      taskCardId,
      isChecked,
    },
  })

  const token = await getToken()
  axios
    .patch(
      `/api/planner/cards/${taskCardId}`,
      {
        checked: isChecked,
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
