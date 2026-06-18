import axios from 'axios'

import { PlannerDispatchContextType } from '@/hooks/Planner/types'

import { sendMutation } from '../apiClient'

export const changeCategoryInfo = (
  categoryId: string,
  newName: string,
  newColor: string,
  dispatch: PlannerDispatchContextType,
  boardId: string
) => {
  const categoryDetails = {
    id: categoryId,
    name: newName,
    color: newColor,
  }
  dispatch({
    type: 'categoryInfoChanged',
    payload: {
      categoryDetails,
    },
  })
  sendMutation(dispatch, () => axios.patch(`/api/planner/categories/${categoryId}`, { newName, newColor }), boardId)
}
