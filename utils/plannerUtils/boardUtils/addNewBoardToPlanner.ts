import axios from 'axios'

import { UNASSIGNED_CATEGORY_COLOR, UNASSIGNED_CATEGORY_ID, UNASSIGNED_CATEGORY_NAME } from '@/constants/constants'
import { PlannerDispatchContextType } from '@/hooks/Planner/types'

import { sendMutation } from '../apiClient'

export const addNewBoardToPlanner = (boardId: string, boardName: string, dispatch: PlannerDispatchContextType) => {
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
  sendMutation(dispatch, () =>
    axios.post('/api/planner/boards', {
      boardId,
      boardName,
      unassignedCategoryDetails,
    })
  )
}
