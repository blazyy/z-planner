import { Draggable, Droppable } from '@hello-pangea/dnd'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import { usePlannerSelector } from '@/hooks/Planner/Planner'

import { AddNewSubTaskButton } from '../AddNewSubTaskButton'
import { EditableSubTask } from './EditableSubTask'

type EditableSubTasksProps = {
  boardId: string
  taskCardId: string
}

export const EditableSubTasks = ({ boardId, taskCardId }: EditableSubTasksProps) => {
  const subTaskIds = usePlannerSelector((s) => s.taskCards[taskCardId].subTasks)
  const subTasks = usePlannerSelector((s) => s.subTasks)
  const subTasksUnderTaskCard = subTaskIds.map((subTaskId) => subTasks[subTaskId])

  // The createPortal is used to create a new portal for the sub tasks whenever they're being dragged.
  // The Dialog component was messing with how the drag and drop functionality of react-pangea-dnd was working.
  // If the createPortal isn't called conditionally, the dragged subtasks render outside the dialog (towards the
  // bottom right of the screen). Setting position to fixed or top and left to 0 caused every dragged item to
  // start from the top of the sub task container, which looked really bad. Portals are the only solution.
  // One node per mount, removed on unmount — the old version appended a fresh div to body on every render.
  const portalRef = useRef<HTMLElement | null>(null)
  if (portalRef.current === null && typeof document !== 'undefined') {
    portalRef.current = document.createElement('div')
  }
  useEffect(() => {
    const portal = portalRef.current
    if (!portal) return
    document.body.appendChild(portal)
    return () => {
      document.body.removeChild(portal)
    }
  }, [])
  const portal = portalRef.current

  return (
    <Droppable droppableId={taskCardId} type='subtask'>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps} className='px-0 flex flex-col rounded-md'>
          {subTasksUnderTaskCard.map((subTask, index) => (
            <Draggable key={subTask.id} draggableId={`${taskCardId}~${subTask.id}`} index={index}>
              {(provided, snapshot) => {
                if (snapshot.isDragging && portal)
                  return createPortal(
                    <EditableSubTask
                      index={index}
                      provided={provided}
                      boardId={boardId}
                      taskCardId={taskCardId}
                      subTask={subTask}
                      isBeingDragged={true}
                    />,
                    portal
                  )
                return (
                  <EditableSubTask
                    index={index}
                    provided={provided}
                    boardId={boardId}
                    taskCardId={taskCardId}
                    subTask={subTask}
                    isBeingDragged={false}
                  />
                )
              }}
            </Draggable>
          ))}
          {provided.placeholder}
          <AddNewSubTaskButton boardId={boardId} taskCardId={taskCardId} />
        </div>
      )}
    </Droppable>
  )
}
