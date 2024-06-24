import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

export const addNewBoardToPlanner = async (
  boardOrder: string[],
  newBoardDetails: {
    id: string
    name: string
    columns: string[]
  },
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) => {
  const newBoardOrder = Array.from(boardOrder)
  newBoardOrder.push(newBoardDetails.id) // Add to beginning of array

  dispatch({
    type: 'newBoardAdded',
    payload: {
      newBoardOrder,
      newBoardDetails,
    },
  })

  axios
    .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/boards`, {
      newBoardOrder,
      newBoardDetails,
    })
    .catch((error) => showErrorBoundary(error))
}
