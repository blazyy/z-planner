'use client'

import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import { useState, createContext, Dispatch, SetStateAction, MutableRefObject } from 'react'

import { onDragEnd } from './utils'
import initialData from './initial-data'
import { TaskCardInfoType, ColumnInfoType, SubTaskInfoType, TaskColumn } from './TaskColumn'

export type PlannerDataType = {
  columns: {
    [columnId: string]: ColumnInfoType
  }
  columnOrder: string[]
  taskCards: {
    [taskCardId: string]: TaskCardInfoType
  }
  subTasks: {
    [taskId: string]: SubTaskInfoType
  }
}

type TaskCardBeingInitializedInfoType = {
  taskCardId: string
  columnId: string
}

type PlannerContextType = {
  data: PlannerDataType
  setData: Dispatch<SetStateAction<PlannerDataType>>
  taskCardBeingInitializedInfo: TaskCardBeingInitializedInfoType | null
  setTaskCardBeingInitializedInfo: Dispatch<SetStateAction<TaskCardBeingInitializedInfoType | null>>
}

export const PlannerContext = createContext<PlannerContextType | null>(null)

export const TaskColumns = () => {
  const [data, setData] = useState<PlannerDataType>(initialData)
  const [taskCardBeingInitializedInfo, setTaskCardBeingInitializedInfo] =
    useState<TaskCardBeingInitializedInfoType | null>(null)

  return (
    <PlannerContext.Provider value={{ data, setData, taskCardBeingInitializedInfo, setTaskCardBeingInitializedInfo }}>
      <DragDropContext
        onDragEnd={(result) => {
          onDragEnd(result, data, setData)
        }}
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
    </PlannerContext.Provider>
  )
}
