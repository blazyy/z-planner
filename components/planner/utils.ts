'use client'
import type { DragStart, DragUpdate, DropResult } from '@hello-pangea/dnd'

import { EphemeralDispatchContextType, PlannerDispatchContextType, PlannerType } from '@/hooks/Planner/types'
import moveCardAcrossColumns from '@/utils/plannerUtils/cardUtils/moveCardAcrossColumns'
import moveCardWithinColumn from '@/utils/plannerUtils/cardUtils/moveCardWithinColumn'
import { changeColumnOrder } from '@/utils/plannerUtils/columnUtils/changeColumnOrder'
import { reorderSubTasks } from '@/utils/plannerUtils/subTaskUtils/reorderSubtasks'

type OnDragEndFunc = (
  result: DropResult,
  dispatch: PlannerDispatchContextType,
  ephemeralDispatch: EphemeralDispatchContextType,
  plannerContext: PlannerType,
  boardId: string
) => void

export const handleOnDragEnd: OnDragEndFunc = (result, dispatch, ephemeralDispatch, plannerContext, boardId) => {
  const { destination, source, draggableId, type } = result
  const { boards, columns, taskCards } = plannerContext

  // Needed to fix bug where subtask drag handle would behave weirdly after being dropped in
  // position where it was originally dragged from
  if (type === 'subtask') {
    ephemeralDispatch({
      type: 'subTaskDragStatusChanged',
      payload: false,
    })
  }
  // If there's no destination or if card is in original position from where it was dragged from, do nothing
  if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
    return
  }

  if (type === 'subtask') {
    return reorderSubTasks(taskCards, draggableId, source.index, destination.index, dispatch, boardId)
  }

  if (type === 'column') {
    return changeColumnOrder(boards, boardId, draggableId, source.index, destination.index, dispatch)
  }

  // Moving a card within the same column
  if (columns[source.droppableId] === columns[destination.droppableId]) {
    return moveCardWithinColumn(
      columns,
      source.droppableId,
      draggableId,
      source.index,
      destination.index,
      dispatch,
      boardId
    )
  }

  // Moving cards between columns
  moveCardAcrossColumns(columns, draggableId, source, destination, dispatch, boardId)
}

type OnDragStartFunction = (dragStartObj: DragStart, ephemeralDispatch: EphemeralDispatchContextType) => void

export const handleOnDragStart: OnDragStartFunction = (dragStartObj, ephemeralDispatch) => {
  if (dragStartObj.type === 'subtask') {
    ephemeralDispatch({
      type: 'subTaskDragStatusChanged',
      payload: true,
    })
  }
}

// --- Screen-reader announcements (a11y-5) -----------------------------------
// @hello-pangea/dnd ships its own visually-hidden aria-live="assertive" region
// and a default message set. We override those defaults with planner-aware,
// human-readable messages by calling provided.announce() inside the responders.
// Using the library's region (rather than a second hand-rolled one) avoids
// duplicate/competing announcements for screen-reader users.

const KIND_LABEL: Record<string, string> = {
  column: 'column',
  card: 'task',
  subtask: 'subtask',
}

// Resolve a draggable's human name from a planner snapshot for the given dnd type.
const getDraggableName = (type: string, draggableId: string, planner: PlannerType): string => {
  if (type === 'column') {
    return planner.columns[draggableId]?.name ?? 'item'
  }
  if (type === 'card') {
    return planner.taskCards[draggableId]?.title ?? 'item'
  }
  if (type === 'subtask') {
    return planner.subTasks[draggableId]?.title ?? 'item'
  }
  return 'item'
}

// Resolve a destination droppable's human name (the column a card lands in).
const getDroppableName = (type: string, droppableId: string, planner: PlannerType): string | null => {
  if (type === 'card') {
    return planner.columns[droppableId]?.name ?? null
  }
  return null
}

export const getDragStartAnnouncement = (start: DragStart, planner: PlannerType): string => {
  const kind = KIND_LABEL[start.type] ?? 'item'
  const name = getDraggableName(start.type, start.draggableId, planner)
  return `Picked up ${kind} ${name} from position ${start.source.index + 1}. Use the arrow keys to move, space or enter to drop, and escape to cancel.`
}

export const getDragUpdateAnnouncement = (update: DragUpdate, planner: PlannerType): string => {
  const kind = KIND_LABEL[update.type] ?? 'item'
  const name = getDraggableName(update.type, update.draggableId, planner)
  if (!update.destination) {
    return `${capitalize(kind)} ${name} is not over a drop area.`
  }
  const position = update.destination.index + 1
  const movedColumns = update.destination.droppableId !== update.source.droppableId
  const destName = getDroppableName(update.type, update.destination.droppableId, planner)
  if (movedColumns && destName) {
    return `${capitalize(kind)} ${name} moved to position ${position} in column ${destName}.`
  }
  return `${capitalize(kind)} ${name} moved to position ${position}.`
}

export const getDragEndAnnouncement = (result: DropResult, planner: PlannerType): string => {
  const kind = KIND_LABEL[result.type] ?? 'item'
  const name = getDraggableName(result.type, result.draggableId, planner)
  if (result.reason === 'CANCEL') {
    return `Movement cancelled. ${capitalize(kind)} ${name} returned to position ${result.source.index + 1}.`
  }
  if (!result.destination) {
    return `${capitalize(kind)} ${name} was dropped outside a drop area and returned to its position.`
  }
  const position = result.destination.index + 1
  const movedColumns = result.destination.droppableId !== result.source.droppableId
  const destName = getDroppableName(result.type, result.destination.droppableId, planner)
  if (movedColumns && destName) {
    return `Dropped ${kind} ${name} at position ${position} in column ${destName}.`
  }
  return `Dropped ${kind} ${name} at position ${position}.`
}

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1)
