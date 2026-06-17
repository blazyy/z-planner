'use client'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { usePlanner, usePlannerDispatch, usePlannerEphemeralDispatch } from '@/hooks/Planner/Planner'

import { EmptyBoardGuidance } from './EmptyBoardGuidance'
import { TaskColumn } from './TaskColumn'
import { handleOnDragEnd, handleOnDragStart } from '../../utils'

export const TaskColumns = ({ boardId }: { boardId: string }) => {
  const plannerContext = usePlanner()
  const { boards } = plannerContext
  const dispatch = usePlannerDispatch()
  const ephemeralDispatch = usePlannerEphemeralDispatch()
  const hasNoColumns = boards[boardId].columns.length === 0

  return (
    <div className='flex flex-1'>
      <DragDropContext
        onDragStart={(dragStartObj) => handleOnDragStart(dragStartObj, ephemeralDispatch)}
        onDragEnd={(result) => handleOnDragEnd(result, dispatch, ephemeralDispatch, plannerContext, boardId)}
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
                {boards[boardId].columns.map((columnId: string, index: number) => (
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
