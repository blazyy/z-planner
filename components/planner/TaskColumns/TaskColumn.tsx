import { Droppable, Draggable } from '@hello-pangea/dnd'

import { TaskCard } from './TaskCard'
import { useContext } from 'react'
import { PlannerContext } from './TaskColumns'

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
  subTasks: string[] | []
}

type TaskColumnProps = {
  index: number
  columnId: string
}

export const TaskColumn = ({ index, columnId }: TaskColumnProps) => {
  const { data } = useContext(PlannerContext)!
  const columnInfo = data.columns[columnId]
  const taskCards = columnInfo.cardIds.map((cardId) => data.taskCards[cardId])
  return (
    <Draggable draggableId={columnInfo.id} index={index}>
      {(provided) => (
        <div className={`task-column flex flex-col mx-2 gap-4`} {...provided.draggableProps} ref={provided.innerRef}>
          <h1 className='text-2xl text-bold text-center' {...provided.dragHandleProps}>
            {columnInfo.title}
          </h1>
          <Droppable droppableId={columnInfo.id} type='card'>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex flex-col transition ease grow p-3 rounded-lg ${
                  snapshot.isDraggingOver ? 'bg-neutral-200' : 'bg-neutral-100'
                }`}
              >
                {taskCards.map((taskCard, index) => {
                  return <TaskCard key={taskCard.id} index={index} id={taskCard.id} />
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
