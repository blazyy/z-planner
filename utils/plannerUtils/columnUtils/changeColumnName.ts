import axios from 'axios'
import { Dispatch } from 'react'
import { sendMutation } from '../apiClient'

export default function changeColumnName(columnId: string, newName: string, dispatch: Dispatch<any>) {
  dispatch({
    type: 'columnNameChanged',
    payload: {
      columnId,
      newName,
    },
  })
  sendMutation(dispatch, () => axios.patch(`/api/planner/columns/${columnId}`, { newName }))
}
