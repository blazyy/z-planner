import type { DraggableLocation } from '@hello-pangea/dnd'
import axios from 'axios'

import { ColumnsType } from '@/hooks/Planner/types'
import { PlannerDispatchContextType } from '@/hooks/Planner/types'

import { sendMutation } from '../apiClient'

export default function moveCardAcrossColumns(
  columns: ColumnsType,
  draggedCardId: string,
  source: DraggableLocation,
  destination: DraggableLocation,
  dispatch: PlannerDispatchContextType
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
  sendMutation(dispatch, () =>
    axios.patch(`/api/planner/cards/${draggedCardId}/move`, {
      sourceColumnId,
      destColumnId,
      sourceColumnTaskCardIds,
      destColumnTaskCardIds,
    })
  )
}
