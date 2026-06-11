import axios from 'axios'
import { PlannerDispatchContextType } from '@/hooks/Planner/types'
import { sendMutation } from '../apiClient'

export default function changeColumnName(columnId: string, newName: string, dispatch: PlannerDispatchContextType) {
  dispatch({
    type: 'columnNameChanged',
    payload: {
      columnId,
      newName,
    },
  })
  sendMutation(dispatch, () => axios.patch(`/api/planner/columns/${columnId}`, { newName }))
}
