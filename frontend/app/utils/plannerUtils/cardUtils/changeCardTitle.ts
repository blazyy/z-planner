import { DEBOUNCE_TIME_MS } from '@/constants/constants'
import axios from 'axios'
import debounce from 'lodash/debounce'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

const debouncedApiCall = debounce(
  async (showErrorBoundary: ErrorBoundaryType, taskCardId: string, newTitle: string) => {
    axios
      .patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/cards/${taskCardId}/title`, {
        newTitle,
      })
      .catch((error) => showErrorBoundary(error))
  },
  DEBOUNCE_TIME_MS
)

export default async function changeCardTitle(
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType,
  taskCardId: string,
  newTitle: string
) {
  dispatch({
    type: 'taskCardTitleChanged',
    payload: {
      taskCardId,
      newTitle,
    },
  })
  debouncedApiCall(showErrorBoundary, taskCardId, newTitle)
}
