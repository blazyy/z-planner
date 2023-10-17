'use client'
import { store } from '@/app/store/store'
import { Dispatch, SetStateAction, createContext, useState } from 'react'
import { Provider } from 'react-redux'
import { TaskCategoryType } from './TaskColumns/TaskCard/CategoryBadge'
import { ColumnInfoType, SubTaskInfoType, TaskCardInfoType } from './TaskColumns/TaskColumn'
import { TaskColumns } from './TaskColumns/TaskColumns'

export type PlannerDataType = {
  columns: {
    [columnId: string]: ColumnInfoType
  }
  columnOrder: string[]
  categories: TaskCategoryType
  taskCards: {
    [taskCardId: string]: TaskCardInfoType
  }
  subTasks: {
    [taskId: string]: SubTaskInfoType
  }
}

type TaskCardBeingInitializedType = {
  taskCardId: string
  columnId: string
  isHighlighted: boolean
}

export type PlannerContextType = {
  isSubTaskBeingDragged: boolean
  setIsSubTaskBeingDragged: Dispatch<SetStateAction<boolean>>
  idOfCardBeingDragged: string
  setIdOfCardBeingDragged: Dispatch<SetStateAction<string>>
  taskCardBeingInitialized: TaskCardBeingInitializedType | null
  setTaskCardBeingInitialized: Dispatch<SetStateAction<TaskCardBeingInitializedType | null>>
  dataEnteredInTaskCardBeingInitialized: boolean
  setDataEnteredInTaskCardBeingInitialized: Dispatch<SetStateAction<boolean>>
}

export const PlannerContext = createContext<PlannerContextType | null>(null)

export const Planner = () => {
  // isSubTaskBeingDragged is used to hide/show drag handles on subtasks on a TaskCard Dialog. Handles should only be shown when
  // hovered over (and not actively dragging a subtask), or, when actively dragging a subtask. The only
  // way to handle this is using onDragStart and onDragEnd handlers, which are only available on the
  // DragDropContext component. This is why this state is in the parent, while it's being used way below
  // in the component tree.
  const [isSubTaskBeingDragged, setIsSubTaskBeingDragged] = useState(false)

  // idOfCardBeingDragged is used to handle transparency of card while being dragged. isDragging coulnd't be used because of
  // a decision to use a wrapper component which made passing the isDragging prop very tricky
  const [idOfCardBeingDragged, setIdOfCardBeingDragged] = useState<string>('')

  // Contains data of card that's being initialized. Didn't make sense to keep this in the store, since the data
  // is only changed in a few places.
  const [taskCardBeingInitialized, setTaskCardBeingInitialized] = useState<TaskCardBeingInitializedType | null>(null)

  // Used when a new task card is added when a previously added one is still being edited- we don't want to lose the information
  // in the previous one.
  const [dataEnteredInTaskCardBeingInitialized, setDataEnteredInTaskCardBeingInitialized] = useState<boolean>(false)

  return (
    <main className='flex min-h-screen flex-col items-center gap-8'>
      <h1 className='text-8xl font-semibold'>Planner</h1>
      <PlannerContext.Provider
        value={{
          isSubTaskBeingDragged,
          setIsSubTaskBeingDragged,
          idOfCardBeingDragged,
          setIdOfCardBeingDragged,
          taskCardBeingInitialized,
          setTaskCardBeingInitialized,
          dataEnteredInTaskCardBeingInitialized,
          setDataEnteredInTaskCardBeingInitialized,
        }}
      >
        <Provider store={store}>
          <TaskColumns />
        </Provider>
      </PlannerContext.Provider>
    </main>
  )
}
