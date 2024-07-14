import { usePlanner } from '@/hooks/Planner/Planner'
import { cn } from '@/lib/utils'
import { Draggable } from '@hello-pangea/dnd'
import { ColumnHeader } from './ColumnHeader'
import { ColumnTasks } from './ColumnTasks'

type TaskColumnProps = {
  index: number
  boardId: string
  columnId: string
}

export const TaskColumn = ({ index, boardId, columnId }: TaskColumnProps) => {
  const { boards, columns } = usePlanner()
  const columnInfo = columns[columnId]
  return (
    <Draggable draggableId={columnInfo.id} index={index}>
      {(provided) => (
        // mr-2 is used instead of gap on parent div because of the dnd library. It does weird things if gap is used.
        <div
          className={cn('flex flex-col gap-1 w-96', index < boards[boardId].columns.length - 1 && 'mr-2')}
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <ColumnHeader columnId={columnInfo.id} dragHandleProps={provided.dragHandleProps} />
          <ColumnTasks boardId={boardId} columnId={columnInfo.id} />
        </div>
      )}
    </Draggable>
  )
}
