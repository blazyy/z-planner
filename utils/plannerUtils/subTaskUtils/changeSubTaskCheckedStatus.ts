import axios from 'axios'
import { Dispatch } from 'react'
import { sendMutation } from '../apiClient'

export default function changeSubTaskCheckedStatus(subTaskId: string, isChecked: boolean, dispatch: Dispatch<any>) {
  dispatch({
    type: 'subTasksCheckedStatusChanged',
    payload: {
      subTaskId,
      isChecked,
    },
  })
  sendMutation(dispatch, () => axios.patch(`/api/planner/subtasks/${subTaskId}`, { checked: isChecked }))
}
