import { produce } from 'immer'
import { Dispatch, SetStateAction, useContext, useState } from 'react'

import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Droppable, Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd'
import { PlannerContext } from '../../TaskColumns'
import { GripVertical } from 'lucide-react'
import { createPortal } from 'react-dom'
import { SubTaskInfoType } from '../../TaskColumn'

type EditableSubTasksProps = {
  taskCardId: string
}

type EditableSubTaskProps = {
  index: number
  provided: DraggableProvided
  subTask: SubTaskInfoType
  isBeingDragged: boolean
}

const EditableSubTask = ({ index, provided, subTask, isBeingDragged }: EditableSubTaskProps) => {
  const { setData, isSubTaskBeingDragged } = useContext(PlannerContext)!
  const [showDragHandle, setShowDragHandle] = useState(isSubTaskBeingDragged)
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={`flex gap-2 items-center ${isBeingDragged ? 'border-2 rounded-lg border-gray-400/50' : ''}`}
      onMouseEnter={() => {
        if (!isSubTaskBeingDragged) setShowDragHandle(true) // Only show drag handle on hover when another subtask isn't being actively dragged
      }}
      onMouseLeave={() => {
        setShowDragHandle(false)
      }}
    >
      <div {...provided.dragHandleProps} className={showDragHandle ? 'visible' : 'invisible'}>
        <GripVertical size={14} />
      </div>
      <Checkbox
        id={`${index}`}
        checked={subTask.checked}
        onCheckedChange={(isChecked) => {
          setData(
            produce((draft) => {
              draft.subTasks[subTask.id].checked = Boolean(isChecked)
            })
          )
        }}
      />
      <Input
        type='text'
        value={subTask.title}
        disabled={subTask.checked}
        className={`h-1 my-1 border-none focus-visible:ring-0 focus-visible:ring-transparent ${
          subTask.checked ? 'line-through disabled:cursor-default' : ''
        }`}
        onChange={(event) => {
          setData(
            produce((draft) => {
              draft.subTasks[subTask.id].title = event.target.value
            })
          )
        }}
      />
    </div>
  )
}

export const EditableSubTasks = ({ taskCardId }: EditableSubTasksProps) => {
  const { data } = useContext(PlannerContext)!
  const subTasks = data.taskCards[taskCardId].subTasks.map((subTaskId) => data.subTasks[subTaskId])

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
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.droppableProps} className='p-1 flex flex-col rounded-md'>
          {subTasks.map((subTask, index) => (
            <Draggable key={subTask.id} draggableId={`${taskCardId}~${subTask.id}`} index={index}>
              {(provided, snapshot) => {
                if (snapshot.isDragging)
                  return createPortal(
                    <EditableSubTask index={index} provided={provided} subTask={subTask} isBeingDragged={true} />,
                    portal
                  )
                return <EditableSubTask index={index} provided={provided} subTask={subTask} isBeingDragged={false} />
              }}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}
