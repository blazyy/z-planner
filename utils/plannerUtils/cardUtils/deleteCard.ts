import axios from 'axios'

import { PlannerDispatchContextType } from '@/hooks/Planner/types'

import { sendMutation } from '../apiClient'

export default function deleteCard(
  columnId: string,
  taskCardId: string,
  dispatch: PlannerDispatchContextType,
  boardId: string
) {
  dispatch({
    type: 'taskCardDeleted',
    payload: {
      columnId,
      taskCardId,
    },
  })
  sendMutation(dispatch, () => axios.delete(`/api/planner/columns/${columnId}/cards/${taskCardId}`), boardId)
}
