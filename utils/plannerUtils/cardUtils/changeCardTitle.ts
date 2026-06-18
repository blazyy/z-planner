import axios from 'axios'

import { PlannerDispatchContextType } from '@/hooks/Planner/types'

import { sendDebouncedMutation } from '../apiClient'

export default function changeCardTitle(
  taskCardId: string,
  newTitle: string,
  dispatch: PlannerDispatchContextType,
  boardId: string
) {
  dispatch({
    type: 'taskCardTitleChanged',
    payload: {
      taskCardId,
      newTitle,
    },
  })
  sendDebouncedMutation(
    `card-title:${taskCardId}`,
    dispatch,
    () => axios.patch(`/api/planner/cards/${taskCardId}`, { title: newTitle }),
    boardId
  )
}
