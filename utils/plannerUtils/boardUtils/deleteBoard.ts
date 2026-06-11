import axios from 'axios'
import { PlannerDispatchContextType } from '@/hooks/Planner/types'
import { sendMutation } from '../apiClient'

export default function deleteBoard(boardId: string, dispatch: PlannerDispatchContextType) {
  dispatch({
    type: 'boardDeleted',
    payload: {
      boardId,
    },
  })
  sendMutation(dispatch, () => axios.delete(`/api/planner/boards/${boardId}`))
}
