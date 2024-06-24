import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from './types'

export const addNewCategory = async (
  newCategoryDetails: {
    id: string
    name: string
    color: string
  },
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) => {
  dispatch({
    type: 'newCategoryAdded',
    payload: {
      newCategoryDetails,
    },
  })

  axios
    .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/categories`, {
      newCategoryDetails,
    })
    .catch((error) => showErrorBoundary(error))
}
