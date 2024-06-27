import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

export default async function deleteCategory(
  boardId: string,
  categoryId: string,
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) {
  dispatch({
    type: 'categoryDeleted',
    payload: {
      boardId,
      categoryId,
    },
  })

  axios
    .delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/boards/${boardId}/categories/${categoryId}`)
    .catch((error) => showErrorBoundary(error))
}
