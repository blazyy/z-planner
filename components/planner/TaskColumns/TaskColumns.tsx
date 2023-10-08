'use client'

import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'

import { handleOnDragStart, handleOnDragEnd } from './utils'
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

export const TaskColumns = () => {
  // The reason taskCardBeingInitializedInfo is in the root and not the component it is being consumed in is because
  // the initializing task card form that appears when the "Add Task" button is clicked, is limited to
  // one instance for the entire board. It is passed to the context provider to make sure that all task
  // columns are aware if there is a card being currently initialized.

  // isSubTaskBeingDragged is sed to hide/show drag handles on subtasks on a TaskCard Dialog. Handles should only be shown when
  // hovered over (and not actively dragging a subtask), or, when actively dragging a subtask. The only
  // way to handle this is using onDragStart and onDragEnd handlers, which are only available on the
  // DragDropContext component. This is why this state is in the parent, while it's being used way below
  // in the component tree.

  // idOfCardBeingDragged is used to handle transparency of card while being dragged. isDragging coulnd't be used because of
  // a decision to use a wrapper component which made passing the isDragging prop very tricky

  const { data } = useAppSelector((state) => state.planner)
  const dispatch = useAppDispatch()

  return (
    <DragDropContext
      onDragStart={(dragStartObj) => handleOnDragStart(dragStartObj, dispatch)}
      onDragEnd={(result) => handleOnDragEnd(data, result, dispatch)}
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
