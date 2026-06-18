import axios from 'axios'

import { PlannerDispatchContextType } from '@/hooks/Planner/types'

import { sendMutation } from '../apiClient'

export const addNewCategory = (
  boardId: string,
  newCategoryDetails: {
    id: string
    name: string
    color: string
  },
  dispatch: PlannerDispatchContextType
) => {
  dispatch({
    type: 'newCategoryAdded',
    payload: {
      boardId,
      newCategoryDetails,
    },
  })
  sendMutation(dispatch, () => axios.post(`/api/planner/boards/${boardId}/categories`, { newCategoryDetails }), boardId)
}
