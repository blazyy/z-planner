import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

export default async function deleteCategory(
  categoryId: string,
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) {
  dispatch({
    type: 'categoryDeleted',
    payload: {
      categoryId,
    },
  })

  axios
    .delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/categories/${categoryId}/delete`)
    .catch((error) => showErrorBoundary(error))
}
