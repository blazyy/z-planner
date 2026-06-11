import axios from 'axios'
import { PlannerDispatchContextType } from '@/hooks/Planner/types'
import { sendDebouncedMutation } from '../apiClient'

export default function changeSubTaskTitle(subTaskId: string, newTitle: string, dispatch: PlannerDispatchContextType) {
  dispatch({
    type: 'subTaskTitleChanged',
    payload: {
      subTaskId,
      newTitle,
    },
  })
  sendDebouncedMutation(`subtask-title:${subTaskId}`, dispatch, () =>
    axios.patch(`/api/planner/subtasks/${subTaskId}`, { title: newTitle })
  )
}
