import axios from 'axios'

import { PlannerDispatchContextType } from '@/hooks/Planner/types'

import { sendMutation } from '../apiClient'

export default function changeCardCheckedStatus(
  columnId: string,
  taskCardId: string,
  isChecked: boolean,
  columnTaskCardIds: string[],
  dispatch: PlannerDispatchContextType,
  boardId: string
) {
  dispatch({
    type: 'taskCardCheckedStatusChanged',
    payload: {
      columnId,
      taskCardId,
      isChecked,
    },
  })

  if (isChecked) {
    // The reducer moves a completed card to the bottom of its column; mirror
    // that here so the new order persists instead of diverging on reload.
    const taskCardOrder = columnTaskCardIds.filter((id) => id !== taskCardId)
    taskCardOrder.push(taskCardId)
    sendMutation(
      dispatch,
      () =>
        axios.patch(`/api/planner/cards/${taskCardId}`, {
          status: 'completed',
          columnId,
          taskCardOrder,
        }),
      boardId
    )
  } else {
    sendMutation(dispatch, () => axios.patch(`/api/planner/cards/${taskCardId}`, { status: 'created' }), boardId)
  }
}
