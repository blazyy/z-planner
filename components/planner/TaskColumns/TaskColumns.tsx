'use client'

import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import { useState, createContext, Dispatch, SetStateAction } from 'react'

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
  isSubTaskBeingDragged: boolean
  setIsSubTaskBeingDragged: Dispatch<SetStateAction<boolean>>
  idOfCardBeingDragged: string
  setIdOfCardBeingDragged: Dispatch<SetStateAction<string>>
}

export const PlannerContext = createContext<PlannerContextType | null>(null)

export const TaskColumns = () => {
  const [data, setData] = useState<PlannerDataType>(initialData)

  // The reason the state below is in the root and not the component it is being consumed in is because
  // the initializing task card form that appears when the "Add Task" button is clicked, is limited to
  // one instance for the entire board. It is passed to the context provider to make sure that all task
  // columns are aware if there is a card being currently initialized.
  const [taskCardBeingInitializedInfo, setTaskCardBeingInitializedInfo] =
    useState<TaskCardBeingInitializedInfoType | null>(null)

  // Used to hide/show drag handles on subtasks on a TaskCard Dialog. Handles should only be shown when
  // hovered over (and not actively dragging a subtask), or, when actively dragging a subtask. The only
  // way to handle this is using onDragStart and onDragEnd handlers, which are only available on the
  // DragDropContext component. This is why this state is in the parent, while it's being used way below
  // in the component tree.
  const [isSubTaskBeingDragged, setIsSubTaskBeingDragged] = useState(false)

  const [idOfCardBeingDragged, setIdOfCardBeingDragged] = useState<string>('')

  return (
    <PlannerContext.Provider
      value={{
        data,
        setData,
        taskCardBeingInitializedInfo,
        setTaskCardBeingInitializedInfo,
        isSubTaskBeingDragged,
        setIsSubTaskBeingDragged,
        idOfCardBeingDragged,
        setIdOfCardBeingDragged,
      }}
    >
      <DragDropContext
        onDragEnd={(result) => {
          onDragEnd(result, data, setData, setIsSubTaskBeingDragged, setIdOfCardBeingDragged)
        }}
        onDragStart={(result) => {
          if (result.type === 'subtask') {
            setIsSubTaskBeingDragged(true)
          }
          if (result.type === 'card') {
            setIdOfCardBeingDragged(result.draggableId)
          }
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
