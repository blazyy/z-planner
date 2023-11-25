import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

export default async function changeSubTaskCheckedStatus(
  subTaskId: string,
  isChecked: boolean,
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) {
  dispatch({
    type: 'subTasksCheckedStatusChanged',
    payload: {
      subTaskId,
      isChecked,
    },
  })
  axios
    .patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/subtasks/${subTaskId}/checked`, {
      isChecked,
    })
    .catch((error) => showErrorBoundary(error))
}
