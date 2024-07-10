import axios from 'axios'
import { Dispatch } from 'react'

export default async function changeColumnName(
  columnId: string,
  newName: string,
  dispatch: Dispatch<any>,
  getToken: () => Promise<string | null>
) {
  dispatch({
    type: 'columnNameChanged',
    payload: {
      columnId,
      newName,
    },
  })
  const token = await getToken()
  axios
    .patch(
      `/api/planner/columns/${columnId}`,
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
