import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

export default async function changeCardCategory(
  taskCardId: string,
  newCategoryId: string,
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) {
  dispatch({
    type: 'taskCategoryChanged',
    payload: {
      taskCardId,
      newCategoryId,
    },
  })
  axios
    .patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/cards/${taskCardId}/category`, {
      newCategoryId,
    })
    .catch((error) => showErrorBoundary(error))
}
