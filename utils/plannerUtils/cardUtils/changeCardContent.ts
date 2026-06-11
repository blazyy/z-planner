import axios from 'axios'
import { PlannerDispatchContextType } from '@/hooks/Planner/types'
import { sendDebouncedMutation } from '../apiClient'

export default function changeCardContent(taskCardId: string, newContent: string, dispatch: PlannerDispatchContextType) {
  dispatch({
    type: 'taskCardContentChanged',
    payload: {
      taskCardId,
      newContent,
    },
  })
  sendDebouncedMutation(`card-content:${taskCardId}`, dispatch, () =>
    axios.patch(`/api/planner/cards/${taskCardId}`, { content: newContent })
  )
}
