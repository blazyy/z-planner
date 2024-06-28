import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

export const changeCategoryInfo = async (
  categoryId: string,
  newName: string,
  newColor: string,
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) => {
  const categoryDetails = {
    id: categoryId,
    name: newName,
    color: newColor,
  }
  dispatch({
    type: 'categoryInfoChanged',
    payload: {
      categoryDetails,
    },
  })
  axios
    .patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/categories/${categoryId}`, {
      newName,
      newColor,
    })
    .catch((error) => showErrorBoundary(error))
}
