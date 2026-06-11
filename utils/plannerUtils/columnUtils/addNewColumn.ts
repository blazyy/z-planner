import { NANOID } from '@/constants/constants'
import { BoardInfoType } from '@/hooks/Planner/types'
import axios from 'axios'
import { Dispatch } from 'react'
import { sendMutation } from '../apiClient'

export const addNewColumn = (board: BoardInfoType, newColumnName: string, dispatch: Dispatch<any>) => {
  const newColumnId = NANOID()
  const newColumnDetails = {
    id: newColumnId,
    name: newColumnName,
    taskCards: [],
  }
  const updatedColumns = Array.from(board.columns)
  updatedColumns.push(newColumnDetails.id)
  dispatch({
    type: 'newColumnAdded',
    payload: {
      boardId: board.id,
      newColumnDetails,
      updatedColumns,
    },
  })
  sendMutation(dispatch, () =>
    axios.post(`/api/planner/boards/${board.id}/columns`, {
      newColumnDetails,
      updatedColumns,
    })
  )
}
