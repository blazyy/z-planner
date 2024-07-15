'use client'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { useAuth } from '@clerk/nextjs'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import { handleOnDragEnd, handleOnDragStart } from '../../utils'
import { TaskColumn } from './TaskColumn'

export const TaskColumns = ({ boardId }: { boardId: string }) => {
  const plannerContext = usePlanner()
  const { boards } = plannerContext
  const { getToken } = useAuth()
  const dispatch = usePlannerDispatch()

  return (
    <div className='flex flex-1'>
      <DragDropContext
        onDragStart={(dragStartObj) => handleOnDragStart(dragStartObj, dispatch)}
        onDragEnd={(result) => handleOnDragEnd(result, dispatch, getToken, plannerContext, boardId)}
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
                <ScrollBar orientation='horizontal' />
              </div>
            </ScrollArea>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
