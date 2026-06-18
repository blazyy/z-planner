'use client'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  usePlannerDispatch,
  usePlannerEphemeralDispatch,
  usePlannerSelector,
  usePlannerStore,
} from '@/hooks/Planner/Planner'

import { EmptyBoardGuidance } from './EmptyBoardGuidance'
import { TaskColumn } from './TaskColumn'
import {
  getDragEndAnnouncement,
  getDragStartAnnouncement,
  getDragUpdateAnnouncement,
  handleOnDragEnd,
  handleOnDragStart,
} from '../../utils'

export const TaskColumns = ({ boardId }: { boardId: string }) => {
  // Render only depends on this board's column order; the drag handler reads a
  // fresh whole-state snapshot via store.getState() at drop time, so it doesn't
  // need a whole-state subscription (which would re-render on every mutation).
  const boardColumns = usePlannerSelector((s) => s.boards[boardId].columns)
  const store = usePlannerStore()
  const dispatch = usePlannerDispatch()
  const ephemeralDispatch = usePlannerEphemeralDispatch()
  const hasNoColumns = boardColumns.length === 0

  return (
    <div className='flex flex-1'>
      <DragDropContext
        onDragStart={(dragStartObj, provided) => {
          handleOnDragStart(dragStartObj, ephemeralDispatch)
          // Override the library's generic default with a planner-aware message,
          // emitted into dnd's built-in aria-live="assertive" region.
          provided.announce(getDragStartAnnouncement(dragStartObj, store.getState()))
        }}
        onDragUpdate={(update, provided) => {
          provided.announce(getDragUpdateAnnouncement(update, store.getState()))
        }}
        onDragEnd={(result, provided) => {
          // Announce BEFORE mutating the store so name lookups still resolve and
          // the message reflects the pre-commit positions the user navigated to.
          provided.announce(getDragEndAnnouncement(result, store.getState()))
          handleOnDragEnd(result, dispatch, ephemeralDispatch, store.getState(), boardId)
        }}
      >
        {/* droppableId doesn't matter here because it won't be interacting with other droppables */}
        <Droppable droppableId='all-columns' direction='horizontal' type='column'>
          {(provided) => (
            <ScrollArea>
              <div
                style={{ minHeight: '87vh', maxHeight: '87vh' }}
                className='flex flex-row'
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {boardColumns.map((columnId: string, index: number) => (
                  <TaskColumn key={columnId} index={index} boardId={boardId} columnId={columnId} />
                ))}
                {provided.placeholder}
                {hasNoColumns && <EmptyBoardGuidance />}
                <ScrollBar orientation='horizontal' />
              </div>
            </ScrollArea>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
