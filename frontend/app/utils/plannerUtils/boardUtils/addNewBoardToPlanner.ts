import { UNASSIGNED_CATEGORY_COLOR, UNASSIGNED_CATEGORY_ID, UNASSIGNED_CATEGORY_NAME } from '@/constants/constants'
import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

export const addNewBoardToPlanner = async (
  boardId: string,
  boardName: string,
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) => {
  const unassignedCategoryDetails = {
    id: UNASSIGNED_CATEGORY_ID,
    name: UNASSIGNED_CATEGORY_NAME,
    color: UNASSIGNED_CATEGORY_COLOR,
  }

  dispatch({
    type: 'newBoardAdded',
    payload: {
      boardId,
      boardName,
      unassignedCategoryDetails,
    },
  })

  axios
    .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/boards`, {
      boardId,
      boardName,
      unassignedCategoryDetails,
    })
    .catch((error) => showErrorBoundary(error))
}
