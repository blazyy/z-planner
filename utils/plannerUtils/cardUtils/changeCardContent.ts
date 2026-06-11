import axios from 'axios'
import { Dispatch } from 'react'
import { sendDebouncedMutation } from '../apiClient'

export default function changeCardContent(taskCardId: string, newContent: string, dispatch: Dispatch<any>) {
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
