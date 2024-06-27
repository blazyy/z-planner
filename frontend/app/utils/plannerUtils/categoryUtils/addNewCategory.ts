import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

export const addNewCategory = async (
  boardId: string,
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
      boardId,
      newCategoryDetails,
    },
  })

  axios
    .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/boards/${boardId}/categories`, {
      newCategoryDetails,
    })
    .catch((error) => showErrorBoundary(error))
}
