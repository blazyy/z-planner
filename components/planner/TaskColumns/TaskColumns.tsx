'use client'
import supabase from '@/app/db/supabase'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import { useContext, useEffect } from 'react'
import { PlannerContext } from '../Planner'
import { AddNewColumnButton } from './EmptyTaskColumnButton'
import { TaskColumn } from './TaskColumn'
import { handleOnDragEnd, handleOnDragStart } from './utils'

// const getData = async () => {
//   const { data, error } = await supabase.from('boards').select()
//   console.log('data', data)
// }

export const TaskColumns = () => {
  const dispatch = useAppDispatch()
  const plannerContext = useContext(PlannerContext)!
  const { data } = useAppSelector((state) => state.planner)

  // useEffect(() => {
  //   getData()
  // }, [])

  return (
    <DragDropContext
      onDragStart={(dragStartObj) => handleOnDragStart(dragStartObj, plannerContext)}
      onDragEnd={(result) => handleOnDragEnd(data, result, dispatch, plannerContext)}
    >
      {/* droppableId doesn't matter here because it won't be interacting with other droppables */}
      <Droppable droppableId='all-columns' direction='horizontal' type='column'>
        {(provided) => (
          <div className='flex flex-row gap-4' {...provided.droppableProps} ref={provided.innerRef}>
            {data.columnOrder.map((columnId, index) => (
              <TaskColumn key={columnId} index={index} columnId={columnId} />
            ))}
            {provided.placeholder}
            <AddNewColumnButton />
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
