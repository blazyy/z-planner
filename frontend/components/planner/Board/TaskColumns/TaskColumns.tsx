'use client'
import { usePlanner } from '@/hooks/Planner/Planner'
import { Droppable } from '@hello-pangea/dnd'
import { AddNewColumnButton } from './AddNewColumnButton'
import { TaskColumn } from './TaskColumn'

type TaskColumnsPropsType = {
  boardId: string
}

export const TaskColumns = ({ boardId }: TaskColumnsPropsType) => {
  const plannerContext = usePlanner()
  const { boards } = plannerContext
  return (
    <div className='flex gap-2 mt-1 p-2 overflow-x-scroll'>
      {/* droppableId doesn't matter here because it won't be interacting with other droppables */}
      <Droppable droppableId='all-columns' direction='horizontal' type='column'>
        {(provided) => (
          <div className='flex flex-row gap-2 pb-72' {...provided.droppableProps} ref={provided.innerRef}>
            {boards[boardId].columns.map((columnId, index) => (
              <TaskColumn key={columnId} index={index} boardId={boardId} columnId={columnId} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <AddNewColumnButton boardId={boardId} />
    </div>
  )
}
