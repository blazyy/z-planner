import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

export default async function deleteCard(
  columnId: string,
  taskCardId: string,
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) {
  dispatch({
    type: 'taskCardDeleted',
    payload: {
      columnId,
      taskCardId,
    },
  })

  axios
    .delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/columns/${columnId}/cards/${taskCardId}/delete`)
    .catch((error) => showErrorBoundary(error))
}
