import { Droppable, Draggable } from '@hello-pangea/dnd'

import { TaskCard } from './TaskCard'
import React from 'react'

export type ColumnInfoType = {
  id: string
  title: string
  cardIds: string[]
}

export type CardInfoType = {
  id: string
  title: string
  category: string
  content: string
  checked: boolean
}

type TaskColumnProps = {
  index: number
  columnInfo: ColumnInfoType
  cards: CardInfoType[]
}

// const TaskColumnWrapper = ({ children }: { children: JSX.Element }) => {}

export const TaskColumn = ({ index, columnInfo, cards }: TaskColumnProps) => {
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
                {cards.map((card, index) => (
                  <TaskCard
                    key={card.id}
                    index={index}
                    id={card.id}
                    title={card.title}
                    category={card.category}
                    content={card.content}
                    checked={card.checked}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  )
}
