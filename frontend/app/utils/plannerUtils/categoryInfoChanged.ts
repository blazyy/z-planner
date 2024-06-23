import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from './types'

export const categoryInfoChanged = async (
  categoryId: string,
  newName: string,
  newColor: string,
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) => {
  dispatch({
    type: 'categoryInfoChanged',
    payload: {
      categoryId,
      newName,
      newColor,
    },
  })

  axios
    .patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/categories/${categoryId}`, {
      newName,
      newColor,
    })
    .catch((error) => showErrorBoundary(error))
}
