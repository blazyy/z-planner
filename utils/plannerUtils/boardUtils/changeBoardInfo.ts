import axios from 'axios'

import { PlannerDispatchContextType } from '@/hooks/Planner/types'

import { sendMutation } from '../apiClient'

export const changeBoardInfo = (boardId: string, newName: string, dispatch: PlannerDispatchContextType) => {
  dispatch({
    type: 'boardNameChanged',
    payload: {
      boardId,
      newName,
    },
  })
  sendMutation(dispatch, () => axios.patch(`/api/planner/boards/${boardId}`, { newName }))
}
