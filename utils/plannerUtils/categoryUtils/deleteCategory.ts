import axios from 'axios'

import { PlannerDispatchContextType } from '@/hooks/Planner/types'

import { sendMutation } from '../apiClient'

export default function deleteCategory(boardId: string, categoryId: string, dispatch: PlannerDispatchContextType) {
  dispatch({
    type: 'categoryDeleted',
    payload: {
      boardId,
      categoryId,
    },
  })
  sendMutation(dispatch, () => axios.delete(`/api/planner/boards/${boardId}/categories/${categoryId}`), boardId)
}
