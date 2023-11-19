'use client'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import { TaskColumn } from './TaskColumn'
import { handleOnDragEnd, handleOnDragStart } from './utils'

export const TaskColumns = () => {
  const plannerContext = usePlanner()!
  const plannerDispatch = usePlannerDispatch()
  const { data } = plannerContext
  return (
    <DragDropContext
      onDragStart={(dragStartObj) => handleOnDragStart(dragStartObj, plannerContext)}
      onDragEnd={(result) => handleOnDragEnd(result, plannerDispatch, plannerContext)}
    >
      {/* droppableId doesn't matter here because it won't be interacting with other droppables */}
      <Droppable droppableId='all-columns' direction='horizontal' type='column'>
        {(provided) => (
          <div className='flex flex-row' {...provided.droppableProps} ref={provided.innerRef}>
            {data.columnOrder.map((columnId, index) => (
              <TaskColumn key={columnId} index={index} columnId={columnId} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
