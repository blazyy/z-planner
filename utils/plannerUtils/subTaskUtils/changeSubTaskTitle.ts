import axios from 'axios'
import { Dispatch } from 'react'
import { sendDebouncedMutation } from '../apiClient'

export default function changeSubTaskTitle(subTaskId: string, newTitle: string, dispatch: Dispatch<any>) {
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
