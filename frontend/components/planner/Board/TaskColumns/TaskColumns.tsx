'use client'
import { usePlanner } from '@/hooks/Planner/Planner'
import { cn } from '@/lib/utils'
import { Droppable } from '@hello-pangea/dnd'
import { AddNewColumnButton } from './AddNewColumnButton'
import { TaskColumn } from './TaskColumn'

type TaskColumnsPropsType = {
  boardId: string
}

export const TaskColumns = ({ boardId }: TaskColumnsPropsType) => {
  const { boards, columns } = usePlanner()
  const numColumns = boards[boardId].columns.length

  if (numColumns === 0) {
    return (
      <div className='flex flex-1 pl-2'>
        <AddNewColumnButton boardId={boardId} />
      </div>
    )
  }

  const hasCards = boards[boardId].columns.reduce((acc, col) => acc + columns[col].taskCards.length, 0) > 0

  return (
    <div className='flex flex-1'>
      <div className={cn('flex flex-1', hasCards ? 'mt-1 p-2' : 'pl-2')}>
        {/* droppableId doesn't matter here because it won't be interacting with other droppables */}
        <Droppable droppableId='all-columns' direction='horizontal' type='column'>
          {(provided) => (
            <div className='flex flex-row flex-1' {...provided.droppableProps} ref={provided.innerRef}>
              {boards[boardId].columns.map((columnId, index) => (
                <TaskColumn key={columnId} index={index} boardId={boardId} columnId={columnId} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  )
}
