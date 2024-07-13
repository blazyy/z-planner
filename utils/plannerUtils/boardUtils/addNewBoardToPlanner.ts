import { UNASSIGNED_CATEGORY_COLOR, UNASSIGNED_CATEGORY_ID, UNASSIGNED_CATEGORY_NAME } from '@/constants/constants'
import axios from 'axios'
import { Dispatch } from 'react'

export const addNewBoardToPlanner = async (
  boardId: string,
  boardName: string,
  dispatch: Dispatch<any>,
  getToken: () => Promise<string | null>
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

  const token = await getToken()
  axios
    .post(
      '/api/planner/boards',
      {
        boardId,
        boardName,
        unassignedCategoryDetails,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .catch((error) => {
      dispatch({
        type: 'backendErrorOccurred',
      })
    })
}
