import { ColumnsType } from '@/hooks/Planner/types'
import axios from 'axios'
import { Dispatch } from 'react'
import { sendMutation } from '../apiClient'

export default function moveCardWithinColumn(
  columns: ColumnsType,
  columnId: string,
  cardId: string,
  sourceIndex: number,
  destIndex: number,
  dispatch: Dispatch<any>
) {
  const startingColumn = columns[columnId]
  const reorderedCardIds = Array.from(startingColumn.taskCards) // Copy of taskCards
  reorderedCardIds.splice(sourceIndex, 1)
  reorderedCardIds.splice(destIndex, 0, cardId)

  dispatch({
    type: 'cardMovedWithinColumn',
    payload: {
      columnId,
      reorderedCardIds,
    },
  })
  sendMutation(dispatch, () => axios.patch(`/api/planner/columns/${columnId}/cards/reorder`, { reorderedCardIds }))
}
