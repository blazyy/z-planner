import { DEBOUNCE_TIME_MS } from '@/constants/constants'
import axios from 'axios'
import debounce from 'lodash/debounce'
import { Dispatch } from 'react'

const debouncedApiCall = debounce(
  async (taskCardId: string, newTitle: string, dispatch: Dispatch<any>, token: string | null) => {
    axios
      .patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/cards/${taskCardId}/title`,
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

export default async function changeCardTitle(
  taskCardId: string,
  newTitle: string,
  dispatch: Dispatch<any>,
  getToken: () => Promise<string | null>
) {
  const token = await getToken()
  dispatch({
    type: 'taskCardTitleChanged',
    payload: {
      taskCardId,
      newTitle,
    },
  })
  debouncedApiCall(taskCardId, newTitle, dispatch, token)
}
