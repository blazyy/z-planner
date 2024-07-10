import { BoardsType } from '@/hooks/Planner/types'
import axios from 'axios'
import { Dispatch } from 'react'

export const changeColumnOrder = async (
  boards: BoardsType,
  boardId: string,
  draggableId: string,
  sourceIndex: number,
  destIndex: number,
  dispatch: Dispatch<any>,
  getToken: () => Promise<string | null>
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
  const token = await getToken()
  axios
    .patch(
      `/api/planner/boards/${boardId}/columns/reorder`,
      {
        newColumnOrder,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .catch((error) => {
      dispatch({
        type: 'backendErrorOccurred',
      })
    })
}
