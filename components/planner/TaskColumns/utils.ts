import { produce } from 'immer'
import { Dispatch, SetStateAction } from 'react'

import { PlannerDataType } from './TaskColumns'
import type { DropResult } from '@hello-pangea/dnd'

type OnDragEndFunction = (
  result: DropResult,
  data: PlannerDataType,
  setData: Dispatch<SetStateAction<PlannerDataType>>,
  setIsSubTaskBeingDragged: Dispatch<SetStateAction<boolean>>,
  setIndexOfCardBeingDragged: Dispatch<SetStateAction<string>>
) => void

export const onDragEnd: OnDragEndFunction = (
  result,
  data,
  setData,
  setIsSubTaskBeingDragged,
  setIndexOfCardBeingDragged
) => {
  const { destination, source, draggableId, type } = result

  // If there's no destination or if card is in original position from where it was dragged from, do nothing
  if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
    return
  }

  if (type === 'subtask') {
    const [taskCardId, subTaskId] = draggableId.split('~')
    // Ensure that the drag-and-drop happens within the same task card
    const reorderedSubTasks = Array.from(data.taskCards[taskCardId].subTasks)
    reorderedSubTasks.splice(source.index, 1)
    reorderedSubTasks.splice(destination.index, 0, subTaskId)
    setData(
      produce((draft) => {
        draft.taskCards[taskCardId].subTasks = reorderedSubTasks
      })
    )
    setIsSubTaskBeingDragged(false)
    return
  }

  if (type === 'column') {
    setData(
      produce((draft) => {
        const newColumnOrder = Array.from(draft.columnOrder)
        newColumnOrder.splice(source.index, 1)
        newColumnOrder.splice(destination.index, 0, draggableId)
        draft.columnOrder = newColumnOrder
      })
    )
    return
  }

  setIndexOfCardBeingDragged('')

  const startingColumn = data.columns[source.droppableId]
  const endingColumn = data.columns[destination.droppableId]

  // Moving a card within the same column
  if (startingColumn === endingColumn) {
    setData(
      produce((draft) => {
        const newCardIds = Array.from(startingColumn.cardIds) // Copy of cardIds
        // Move cardId from old index to new index
        newCardIds.splice(source.index, 1)
        newCardIds.splice(destination.index, 0, draggableId)
        const newColumn = {
          ...startingColumn,
          cardIds: newCardIds,
        }
        draft.columns[newColumn.id] = newColumn
      })
    )

    return
  }

  // Moving cards between columns
  setData(
    produce((draft) => {
      const startCardIds = Array.from(startingColumn.cardIds) // Copy of cardIds
      startCardIds.splice(source.index, 1)
      const newStartColumn = {
        ...startingColumn,
        cardIds: startCardIds,
      }
      const endCardIds = Array.from(endingColumn.cardIds)
      endCardIds.splice(destination.index, 0, draggableId)
      const newEndColumn = {
        ...endingColumn,
        cardIds: endCardIds,
      }
      draft.columns[newStartColumn.id] = newStartColumn
      draft.columns[newEndColumn.id] = newEndColumn
    })
  )
}
