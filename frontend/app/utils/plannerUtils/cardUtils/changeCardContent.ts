import { DEBOUNCE_TIME_MS } from '@/constants/constants'
import axios from 'axios'
import debounce from 'lodash/debounce'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

const debouncedApiCall = debounce(
  async (showErrorBoundary: ErrorBoundaryType, taskCardId: string, newContent: string) => {
    axios
      .patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/cards/${taskCardId}/content`, {
        newContent,
      })
      .catch((error) => showErrorBoundary(error))
  },
  DEBOUNCE_TIME_MS
)

export default async function changeCardContent(
  taskCardId: string,
  newContent: string,
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) {
  dispatch({
    type: 'taskCardContentChanged',
    payload: {
      taskCardId,
      newContent,
    },
  })
  debouncedApiCall(showErrorBoundary, taskCardId, newContent)
}
