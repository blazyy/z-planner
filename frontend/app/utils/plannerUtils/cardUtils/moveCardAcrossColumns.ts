import { ColumnsType } from '@/hooks/Planner/types'
import axios from 'axios'
import { Dispatch } from 'react'

export default async function moveCardAcrossColumns(
  columns: ColumnsType,
  draggedCardId: string,
  source: any,
  destination: any,
  dispatch: Dispatch<any>,
  getToken: () => Promise<string | null>
) {
  const sourceColumnId = source.droppableId
  const sourceColumn = columns[sourceColumnId]
  const sourceColumnTaskCardIds = Array.from(sourceColumn.taskCards) // Copy of taskCards
  sourceColumnTaskCardIds.splice(source.index, 1)

  const destColumnId = destination.droppableId
  const destColumn = columns[destColumnId]
  const destColumnTaskCardIds = Array.from(destColumn.taskCards)
  destColumnTaskCardIds.splice(destination.index, 0, draggedCardId)

  dispatch({
    type: 'cardMovedAcrossColumns',
    payload: {
      sourceColumnId,
      destColumnId,
      sourceColumnTaskCardIds,
      destColumnTaskCardIds,
    },
  })
  const token = await getToken()
  axios
    .patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/columns/move`,
      {
        sourceColumnId,
        destColumnId,
        sourceColumnTaskCardIds,
        destColumnTaskCardIds,
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
