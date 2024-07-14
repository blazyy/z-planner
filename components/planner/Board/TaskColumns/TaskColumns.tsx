'use client'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { useAuth } from '@clerk/nextjs'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import { handleOnDragEnd, handleOnDragStart } from '../../utils'
import { TaskColumn } from './TaskColumn'

export const TaskColumns = ({ boardId }: { boardId: string }) => {
  const plannerContext = usePlanner()
  const { boards, columns } = plannerContext
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
            <div className='flex flex-row' {...provided.droppableProps} ref={provided.innerRef}>
              {boards[boardId].columns.map((columnId, index) => (
                <TaskColumn key={columnId} index={index} boardId={boardId} columnId={columnId} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
