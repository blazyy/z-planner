'use client'
import { store } from '@/app/store/store'
import { Dispatch, SetStateAction, createContext, useState } from 'react'
import { Provider } from 'react-redux'
import { ColumnInfoType, SubTaskInfoType, TaskCardInfoType } from './TaskColumns/TaskColumn'
import { TaskColumns } from './TaskColumns/TaskColumns'

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

export type PlannerContextType = {
  isSubTaskBeingDragged: boolean
  setIsSubTaskBeingDragged: Dispatch<SetStateAction<boolean>>
  idOfCardBeingDragged: string
  setIdOfCardBeingDragged: Dispatch<SetStateAction<string>>
}

export const PlannerContext = createContext<PlannerContextType | null>(null)

export default function () {
  // isSubTaskBeingDragged is used to hide/show drag handles on subtasks on a TaskCard Dialog. Handles should only be shown when
  // hovered over (and not actively dragging a subtask), or, when actively dragging a subtask. The only
  // way to handle this is using onDragStart and onDragEnd handlers, which are only available on the
  // DragDropContext component. This is why this state is in the parent, while it's being used way below
  // in the component tree.
  const [isSubTaskBeingDragged, setIsSubTaskBeingDragged] = useState(false)

  // idOfCardBeingDragged is used to handle transparency of card while being dragged. isDragging coulnd't be used because of
  // a decision to use a wrapper component which made passing the isDragging prop very tricky
  const [idOfCardBeingDragged, setIdOfCardBeingDragged] = useState<string>('')

  return (
    <main className='flex min-h-screen flex-col items-center gap-8'>
      <h1 className='text-8xl font-semibold'>Planner</h1>
      <PlannerContext.Provider
        value={{ isSubTaskBeingDragged, setIsSubTaskBeingDragged, idOfCardBeingDragged, setIdOfCardBeingDragged }}
      >
        <Provider store={store}>
          <TaskColumns />
        </Provider>
      </PlannerContext.Provider>
    </main>
  )
}
