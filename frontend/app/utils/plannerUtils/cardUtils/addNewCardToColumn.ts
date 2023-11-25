import { ColumnInfoType } from '@/hooks/Planner/types'
import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

export const addNewCardToColumn = async (
  column: ColumnInfoType,
  cardDetails: {
    id: string
    title: string
    category: string
    content: string | undefined
  },
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) => {
  const newTaskCardDetails = {
    id: cardDetails.id,
    title: cardDetails.title,
    category: cardDetails.category,
    content: cardDetails.content,
    checked: false,
    subTasks: [],
  }

  const updatedTaskCards = Array.from(column.taskCards)
  updatedTaskCards.unshift(cardDetails.id) // Add to beginning of array

  dispatch({
    type: 'newTaskCardAdded',
    payload: {
      columnId: column.id,
      newTaskCardDetails,
      updatedTaskCards,
    },
  })

  axios
    .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/columns/${column.id}/cards`, {
      columnId: column.id,
      newTaskCardDetails,
      updatedTaskCards,
    })
    .catch((error) => showErrorBoundary(error))
}
