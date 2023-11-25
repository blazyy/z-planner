import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

export default async function changeCardCategory(
  taskCardId: string,
  newCategory: string,
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) {
  dispatch({
    type: 'taskCategoryChanged',
    payload: {
      taskCardId,
      newCategory,
    },
  })
  axios
    .patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/cards/${taskCardId}/category`, {
      newCategory,
    })
    .catch((error) => showErrorBoundary(error))
}
