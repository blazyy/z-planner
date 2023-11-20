import { usePlanner } from '@/hooks/Planner/Planner'
import { Draggable, Droppable } from '@hello-pangea/dnd'
import { createPortal } from 'react-dom'
import { AddNewSubTaskButton } from '../AddNewSubTaskButton'
import { EditableSubTask } from './EditableSubTask'

type EditableSubTasksProps = {
  taskCardId: string
}

export const EditableSubTasks = ({ taskCardId }: EditableSubTasksProps) => {
  const { taskCards, subTasks } = usePlanner()
  const subTasksUnderTaskCard = taskCards[taskCardId].subTasks.map((subTaskId) => subTasks[subTaskId])

  // ------------------------------------------------------------------------------------------------------------------------------------------------

  // The createPortal is used to create a new portal for the sub tasks whenever they're being dragged.
  // The Dialog component was messing with how the drag and drop functionality of react-pangea-dnd was working.
  // If the createPortal isn't called conditionally, the dragged subtasks render outside the dialog (towards the
  // bottom right of the screen). Setting position to fixed or top and left to 0 caused every dragged item to
  // start from the top of the sub task container, which looked really bad. Portals are the only solution.
  const portal: HTMLElement = document.createElement('div')
  document.body.appendChild(portal)

  // ------------------------------------------------------------------------------------------------------------------------------------------------

  return (
    <Droppable droppableId={taskCardId} type='subtask'>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps} className='p-1 flex flex-col rounded-md'>
          {subTasksUnderTaskCard.map((subTask, index) => (
            <Draggable key={subTask.id} draggableId={`${taskCardId}~${subTask.id}`} index={index}>
              {(provided, snapshot) => {
                if (snapshot.isDragging)
                  return createPortal(
                    <EditableSubTask
                      index={index}
                      provided={provided}
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
                    taskCardId={taskCardId}
                    subTask={subTask}
                    isBeingDragged={false}
                  />
                )
              }}
            </Draggable>
          ))}
          {provided.placeholder}
          <AddNewSubTaskButton taskCardId={taskCardId} />
        </div>
      )}
    </Droppable>
  )
}
