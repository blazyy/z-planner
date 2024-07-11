import { BoardInfoType } from '@/hooks/Planner/types'
import axios from 'axios'
import { nanoid } from 'nanoid'
import { Dispatch } from 'react'

export const addNewColumn = async (
  board: BoardInfoType,
  newColumnName: string,
  dispatch: Dispatch<any>,
  getToken: () => Promise<string | null>
) => {
  const newColumnId = nanoid()
  const newColumnDetails = {
    id: newColumnId,
    name: newColumnName,
    taskCards: [],
  }
  const updatedColumns = Array.from(board.columns)
  updatedColumns.push(newColumnDetails.id) // Add to beginning of array
  dispatch({
    type: 'newColumnAdded',
    payload: {
      boardId: board.id,
      newColumnDetails,
      updatedColumns,
    },
  })
  const token = await getToken()
  axios
    .post(
      `/api/planner/boards/${board.id}/columns`,
      {
        newColumnDetails,
        updatedColumns,
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
