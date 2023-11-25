import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

export default async function changeCardCheckedStatus(
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType,
  taskCardId: string,
  isChecked: boolean
) {
  dispatch({
    type: 'taskCardCheckedStatusChanged',
    payload: {
      taskCardId,
      isChecked,
    },
  })
  axios
    .patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/cards/${taskCardId}/checked`, {
      isChecked,
    })
    .catch((error) => showErrorBoundary(error))
}
