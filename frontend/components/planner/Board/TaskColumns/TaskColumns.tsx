'use client'
import { usePlanner } from '@/hooks/Planner/Planner'
import { Droppable } from '@hello-pangea/dnd'
import { TaskColumn } from './TaskColumn'

type TaskColumnsPropsType = {
  boardId: string
}

export const TaskColumns = ({ boardId }: TaskColumnsPropsType) => {
  const plannerContext = usePlanner()
  const { boards } = plannerContext
  return (
    <div className='flex mt-1 overflow-x-scroll p-2'>
      {/* droppableId doesn't matter here because it won't be interacting with other droppables */}
      <Droppable droppableId='all-columns' direction='horizontal' type='column'>
        {(provided) => (
          <div className='flex flex-row pb-72 gap-2' {...provided.droppableProps} ref={provided.innerRef}>
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
