import { usePlanner } from '@/hooks/Planner/Planner'
import { Draggable, Droppable } from '@hello-pangea/dnd'
import { AddTaskCardButton } from './AddTaskCardButton'
import { InitializingTaskCard } from './TaskCard/InitializingTaskCard/InitializingTaskCard'
import { TaskCard } from './TaskCard/TaskCard'

type TaskColumnProps = {
  index: number
  columnId: string
}

export const TaskColumn = ({ index, columnId }: TaskColumnProps) => {
  const { columns, taskCardBeingInitialized } = usePlanner()!
  const columnInfo = columns[columnId]
  return (
    <Draggable draggableId={columnInfo.id} index={index}>
      {(provided) => (
        <div className={`task-column flex flex-col mx-2 gap-2`} {...provided.draggableProps} ref={provided.innerRef}>
          <h1 className='text-2xl text-bold text-center' {...provided.dragHandleProps}>
            {columnInfo.title}
          </h1>
          <AddTaskCardButton columnId={columnInfo.id} />
          <Droppable droppableId={columnInfo.id} type='card'>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex flex-col transition ease grow p-3 rounded-lg ${
                  snapshot.isDraggingOver ? 'bg-neutral-400' : 'bg-neutral-300'
                }`}
              >
                {taskCardBeingInitialized && taskCardBeingInitialized.columnId === columnId && (
                  <InitializingTaskCard columnId={columnInfo.id} />
                )}
                {columnInfo.cardIds.map((taskCardId, index) => {
                  return <TaskCard key={taskCardId} index={index} columnId={columnId} taskCardId={taskCardId} />
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  )
}
