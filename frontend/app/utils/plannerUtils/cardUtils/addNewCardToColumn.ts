import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

export const addNewCardToColumn = async (
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType,
  columnId: string,
  cardDetails: {
    id: string
    title: string
    category: string
    content: string | undefined
  }
) => {
  const newTaskCardDetails = {
    id: cardDetails.id,
    title: cardDetails.title,
    category: cardDetails.category,
    content: cardDetails.content,
    checked: false,
    subTasks: [],
  }
  dispatch({
    type: 'newTaskCardAdded',
    payload: {
      columnId,
      newTaskCardDetails,
    },
  })
  axios
    .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/columns/${columnId}/cards`, {
      columnId,
      newTaskCardDetails,
    })
    .catch((error) => showErrorBoundary(error))
}
