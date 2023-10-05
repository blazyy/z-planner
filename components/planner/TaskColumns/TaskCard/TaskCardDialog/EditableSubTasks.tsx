import { produce } from 'immer'
import { createPortal } from 'react-dom'
import { useContext, useState } from 'react'
import { Droppable, Draggable, DraggableProvided } from '@hello-pangea/dnd'

import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { GripVertical } from 'lucide-react'

import { PlannerContext } from '../../TaskColumns'
import { SubTaskInfoType } from '../../TaskColumn'
import { AddNewSubTaskButton } from './AddNewSubTaskButton'

type EditableSubTasksProps = {
  taskCardId: string
}

type EditableSubTaskProps = {
  index: number
  provided: DraggableProvided
  taskCardId: string
  subTask: SubTaskInfoType
  isBeingDragged: boolean
}

const EditableSubTask = ({ index, provided, taskCardId, subTask, isBeingDragged }: EditableSubTaskProps) => {
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
        autoFocus
        id={subTask.id}
        type='text'
        value={subTask.title}
        className='h-1 my-1 text-gray-500 border-none focus-visible:ring-0 focus-visible:ring-transparent'
        onKeyDown={(event) => {
          if (event.key === 'Backspace' && subTask.title === '') {
            setData(
              produce((draft) => {
                /* -------------------------------------------------------- */
                /* Moves cursor focus to subtask above using the subtask ID */
                const subTaskIds = draft.taskCards[taskCardId].subTasks
                let idOfSubTaskAbove = null
                for (let subTaskId of subTaskIds) {
                  if (subTaskId === subTask.id) break
                  idOfSubTaskAbove = subTaskId
                }
                if (idOfSubTaskAbove) document.getElementById(idOfSubTaskAbove)?.focus()
                /* -------------------------------------------------------- */
                delete draft.subTasks[subTask.id]
                draft.taskCards[taskCardId].subTasks = draft.taskCards[taskCardId].subTasks.filter(
                  (subTaskId) => subTaskId !== subTask.id
                )
              })
            )
          }
        }}
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
          <AddNewSubTaskButton taskCardId={taskCardId} />
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}
