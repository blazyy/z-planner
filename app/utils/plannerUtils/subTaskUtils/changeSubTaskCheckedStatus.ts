import axios from 'axios'
import { Dispatch } from 'react'

export default async function changeSubTaskCheckedStatus(
  subTaskId: string,
  isChecked: boolean,
  dispatch: Dispatch<any>,
  getToken: () => Promise<string | null>
) {
  dispatch({
    type: 'subTasksCheckedStatusChanged',
    payload: {
      subTaskId,
      isChecked,
    },
  })
  const token = await getToken()
  axios
    .patch(
      `/api/planner/subtasks/${subTaskId}`,
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
