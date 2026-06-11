import axios from 'axios'
import { Dispatch } from 'react'
import { sendDebouncedMutation } from '../apiClient'

export default function changeCardTitle(taskCardId: string, newTitle: string, dispatch: Dispatch<any>) {
  dispatch({
    type: 'taskCardTitleChanged',
    payload: {
      taskCardId,
      newTitle,
    },
  })
  sendDebouncedMutation(`card-title:${taskCardId}`, dispatch, () =>
    axios.patch(`/api/planner/cards/${taskCardId}`, { title: newTitle })
  )
}
