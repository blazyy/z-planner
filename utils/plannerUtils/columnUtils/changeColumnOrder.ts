import { BoardsType } from '@/hooks/Planner/types'
import axios from 'axios'
import { Dispatch } from 'react'
import { sendMutation } from '../apiClient'

export const changeColumnOrder = (
  boards: BoardsType,
  boardId: string,
  draggableId: string,
  sourceIndex: number,
  destIndex: number,
  dispatch: Dispatch<any>
) => {
  const newColumnOrder = Array.from(boards[boardId].columns)
  newColumnOrder.splice(sourceIndex, 1)
  newColumnOrder.splice(destIndex, 0, draggableId)
  dispatch({
    type: 'columnsReordered',
    payload: {
      boardId,
      newColumnOrder,
    },
  })
  sendMutation(dispatch, () => axios.patch(`/api/planner/boards/${boardId}/columns/reorder`, { newColumnOrder }))
}
