import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from './types'

export const changeCategoryColor = async (
  category: string,
  newColor: string,
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) => {
  dispatch({
    type: 'categoryColorChanged',
    payload: {
      category,
      newColor,
    },
  })

  axios
    .patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/categories/${category}`, {
      newColor,
    })
    .catch((error) => showErrorBoundary(error))
}
