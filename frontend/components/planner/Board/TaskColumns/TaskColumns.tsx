'use client'
import { usePlanner } from '@/hooks/Planner/Planner'
import { Droppable } from '@hello-pangea/dnd'
import { TaskColumn } from './TaskColumn'

type TaskColumnsPropsType = {
  boardId: string
}

export const TaskColumns = ({ boardId }: TaskColumnsPropsType) => {
  const { boards } = usePlanner()
  return (
    <div className='flex mt-1 p-2 overflow-x-scroll'>
      {/* droppableId doesn't matter here because it won't be interacting with other droppables */}
      <Droppable droppableId='all-columns' direction='horizontal' type='column'>
        {(provided) => (
          <div className='flex flex-row pb-72' {...provided.droppableProps} ref={provided.innerRef}>
            {boards[boardId].columns.map((columnId, index) => (
              <TaskColumn key={columnId} index={index} boardId={boardId} columnId={columnId} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
