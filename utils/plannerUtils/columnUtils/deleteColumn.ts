import axios from 'axios'
import { PlannerDispatchContextType } from '@/hooks/Planner/types'
import { sendMutation } from '../apiClient'

export default function deleteColumn(boardId: string, columnId: string, dispatch: PlannerDispatchContextType) {
  dispatch({
    type: 'columnDeleted',
    payload: {
      boardId,
      columnId,
    },
  })
  sendMutation(dispatch, () => axios.delete(`/api/planner/boards/${boardId}/columns/${columnId}`))
}
