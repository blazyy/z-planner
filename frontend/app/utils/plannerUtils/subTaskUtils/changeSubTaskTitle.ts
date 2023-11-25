import { DEBOUNCE_TIME_MS } from '@/constants/constants'
import axios from 'axios'
import debounce from 'lodash/debounce'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

const debouncedApiCall = debounce(async (subTaskId: string, newTitle: string, showErrorBoundary: ErrorBoundaryType) => {
  axios
    .patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/subtasks/${subTaskId}/title`, {
      newTitle,
    })
    .catch((error) => showErrorBoundary(error))
}, DEBOUNCE_TIME_MS)

export default async function changeSubTaskTitle(
  subTaskId: string,
  newTitle: string,
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) {
  dispatch({
    type: 'subTaskTitleChanged',
    payload: {
      subTaskId,
      newTitle,
    },
  })
  debouncedApiCall(subTaskId, newTitle, showErrorBoundary)
}
