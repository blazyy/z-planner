import axios from 'axios'
import { PlannerDispatchContextType } from '@/hooks/Planner/types'
import { sendMutation } from '../apiClient'

export default function changeSubTaskCheckedStatus(subTaskId: string, isChecked: boolean, dispatch: PlannerDispatchContextType) {
  dispatch({
    type: 'subTasksCheckedStatusChanged',
    payload: {
      subTaskId,
      isChecked,
    },
  })
  sendMutation(dispatch, () => axios.patch(`/api/planner/subtasks/${subTaskId}`, { checked: isChecked }))
}
