'use client'

import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import { useState, createContext, Dispatch, SetStateAction } from 'react'

import { onDragEnd } from './utils'
import initialData from './initial-data'
import { CardInfoType, ColumnInfoType, TaskColumn } from './TaskColumn'

export type PlannerDataType = {
  cards: {
    [cardId: string]: CardInfoType
  }
  columns: {
    [columnId: string]: ColumnInfoType
  }
  columnOrder: string[]
}

type PlannerContextType = {
  setData: Dispatch<SetStateAction<PlannerDataType>>
}

export const PlannerContext = createContext<PlannerContextType | null>(null)

export const TaskColumns = () => {
  const [data, setData] = useState<PlannerDataType>(initialData)

  return (
    <PlannerContext.Provider value={{ setData }}>
      <DragDropContext
        onDragEnd={(result) => {
          onDragEnd(result, data, setData)
        }}
      >
        {/* droppableId doesn't matter here because it won't be interacting with other droppables */}
        <Droppable droppableId='all-columns' direction='horizontal' type='column'>
          {(provided) => (
            <div className='flex flex-row' {...provided.droppableProps} ref={provided.innerRef}>
              {data.columnOrder.map((columnId, index) => {
                const columnInfo = data.columns[columnId]
                const cards = columnInfo.cardIds.map((cardId) => data.cards[cardId])
                return <TaskColumn key={columnId} index={index} columnInfo={columnInfo} cards={cards} />
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </PlannerContext.Provider>
  )
}
