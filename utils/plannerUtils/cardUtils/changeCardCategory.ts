import axios from 'axios'

import { PlannerDispatchContextType } from '@/hooks/Planner/types'

import { sendMutation } from '../apiClient'

export default function changeCardCategory(
  taskCardId: string,
  newCategoryId: string,
  dispatch: PlannerDispatchContextType,
  boardId: string
) {
  dispatch({
    type: 'taskCategoryChanged',
    payload: {
      taskCardId,
      newCategoryId,
    },
  })
  sendMutation(dispatch, () => axios.patch(`/api/planner/cards/${taskCardId}`, { category: newCategoryId }), boardId)
}
