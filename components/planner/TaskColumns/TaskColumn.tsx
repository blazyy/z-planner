import { useAppSelector } from '@/app/store/hooks'
import { Droppable, Draggable } from '@hello-pangea/dnd'

import { TaskCard } from './TaskCard/TaskCard'
import { AddTaskCardButton } from './AddTaskCardButton'
import { InitializingTaskCard } from './TaskCard/InitializingTaskCard/InitializingTaskCard'

export type ColumnInfoType = {
  id: string
  title: string
  cardIds: string[]
}

export type SubTaskInfoType = {
  id: string
  title: string
  checked: boolean
}

export type TaskCardInfoType = {
  id: string
  title: string
  category: string
  content: string
  checked: boolean
  subTasks: string[]
}

type TaskColumnProps = {
  index: number
  columnId: string
}

export const TaskColumn = ({ index, columnId }: TaskColumnProps) => {
  const { data, taskCardBeingInitializedInfo } = useAppSelector((state) => state.planner)

  const columnInfo = data.columns[columnId]
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
                  snapshot.isDraggingOver ? 'bg-neutral-200' : 'bg-neutral-100'
                }`}
              >
                {taskCardBeingInitializedInfo && taskCardBeingInitializedInfo.columnId === columnId && (
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
