'use client'

import { useContext } from 'react'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'

import { TaskColumn } from './TaskColumn'
import { PlannerContext } from '../Planner'
import { handleOnDragStart, handleOnDragEnd } from './utils'

export const TaskColumns = () => {
  const dispatch = useAppDispatch()
  const plannerContext = useContext(PlannerContext)!
  const { data } = useAppSelector((state) => state.planner)

  return (
    <DragDropContext
      onDragStart={(dragStartObj) => handleOnDragStart(dragStartObj, plannerContext)}
      onDragEnd={(result) => handleOnDragEnd(data, result, dispatch, plannerContext)}
    >
      {/* droppableId doesn't matter here because it won't be interacting with other droppables */}
      <Droppable droppableId='all-columns' direction='horizontal' type='column'>
        {(provided) => (
          <div className='flex flex-row' {...provided.droppableProps} ref={provided.innerRef}>
            {data.columnOrder.map((columnId, index) => (
              <TaskColumn key={columnId} index={index} columnId={columnId} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
