import { DEBOUNCE_TIME_MS } from '@/constants/constants'
import axios from 'axios'
import debounce from 'lodash/debounce'
import { Dispatch } from 'react'

const debouncedApiCall = debounce(
  async (subTaskId: string, newTitle: string, dispatch: Dispatch<any>, token: string | null) => {
    axios
      .patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/subtasks/${subTaskId}/title`,
        {
          newTitle,
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
  },
  DEBOUNCE_TIME_MS
)

export default async function changeSubTaskTitle(
  subTaskId: string,
  newTitle: string,
  dispatch: Dispatch<any>,
  getToken: () => Promise<string | null>
) {
  const token = await getToken()
  dispatch({
    type: 'subTaskTitleChanged',
    payload: {
      subTaskId,
      newTitle,
    },
  })
  debouncedApiCall(subTaskId, newTitle, dispatch, token)
}
