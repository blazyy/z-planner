'use client'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import { useErrorBoundary } from 'react-error-boundary'
import { AddNewColumnButton } from './AddColumnButton'
import { TaskColumn } from './TaskColumn'
import { handleOnDragEnd, handleOnDragStart } from './utils'

type TaskColumnsPropsType = {
  boardId: string
}

export const TaskColumns = ({ boardId }: TaskColumnsPropsType) => {
  const plannerContext = usePlanner()
  const plannerDispatch = usePlannerDispatch()
  const { showBoundary } = useErrorBoundary()
  const { boards } = plannerContext
  return (
    <DragDropContext
      onDragStart={(dragStartObj) => handleOnDragStart(dragStartObj, plannerDispatch)}
      onDragEnd={(result) => handleOnDragEnd(result, plannerDispatch, plannerContext, showBoundary, boardId)}
    >
      {/* droppableId doesn't matter here because it won't be interacting with other droppables */}
      <Droppable droppableId='all-columns' direction='horizontal' type='column'>
        {(provided) => (
          <div className='flex flex-row' {...provided.droppableProps} ref={provided.innerRef}>
            {boards[boardId].columns.map((columnId, index) => (
              <TaskColumn key={columnId} index={index} boardId={boardId} columnId={columnId} />
            ))}
            {provided.placeholder}
            <AddNewColumnButton boardId={boardId} />
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
