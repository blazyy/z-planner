import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

export default async function changeCardCheckedStatus(
  taskCardId: string,
  isChecked: boolean,
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
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
