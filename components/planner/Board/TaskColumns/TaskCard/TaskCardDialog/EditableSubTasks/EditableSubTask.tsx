import { DraggableProvided } from '@hello-pangea/dnd'
import { GripVertical } from 'lucide-react'
import { useState } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { usePlannerDispatch, usePlannerEphemeral, usePlannerSelector } from '@/hooks/Planner/Planner'
import { SubTaskInfoType } from '@/hooks/Planner/types'
import changeSubTaskCheckedStatus from '@/utils/plannerUtils/subTaskUtils/changeSubTaskCheckedStatus'
import changeSubTaskTitle from '@/utils/plannerUtils/subTaskUtils/changeSubTaskTitle'

import { handleKeyDownOnSubTask } from './utils'

type EditableSubTaskProps = {
  index: number
  provided: DraggableProvided
  boardId: string
  taskCardId: string
  subTask: SubTaskInfoType
  isBeingDragged: boolean
}

export const EditableSubTask = ({
  index,
  provided,
  boardId,
  taskCardId,
  subTask,
  isBeingDragged,
}: EditableSubTaskProps) => {
  // Subscribe to only this card. handleKeyDownOnSubTask reads taskCards[taskCardId]
  // (for arrow-key focus and Enter/Backspace) and never reads the subTasks map, so
  // a single-entry map + empty subTasks preserves behavior without a wide subscription.
  const taskCard = usePlannerSelector((s) => s.taskCards[taskCardId])
  const { isSubTaskBeingDragged } = usePlannerEphemeral()
  const [showDragHandle, setShowDragHandle] = useState(isSubTaskBeingDragged)
  const dispatch = usePlannerDispatch()!
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={`flex gap-2 items-center ${isBeingDragged ? 'border-2 rounded-lg border-gray-400/50' : ''}`}
      onMouseEnter={() => {
        if (!isSubTaskBeingDragged) {
          setShowDragHandle(true) // Only show drag handle on hover when another subtask isn't being actively dragged
        }
      }}
      onMouseLeave={() => {
        setShowDragHandle(false)
      }}
    >
      {/* focus-visible keeps the handle reachable by keyboard (dnd's dragHandleProps
          make it focusable) without changing the mouse hover behavior */}
      <div {...provided.dragHandleProps} className={showDragHandle ? 'visible' : 'invisible focus-visible:visible'}>
        <GripVertical size={14} />
      </div>
      <Checkbox
        id={`${index}`}
        checked={subTask.checked}
        onCheckedChange={(isChecked) => changeSubTaskCheckedStatus(subTask.id, Boolean(isChecked), dispatch, boardId)}
      />
      <Input
        // eslint-disable-next-line jsx-a11y/no-autofocus -- intentional: a freshly-created sub-task input auto-focuses so the user can type the title immediately.
        autoFocus
        id={subTask.id}
        type='text'
        value={subTask.title}
        className='my-1 px-1 border-none h-1 text-gray-500 dark:text-gray-400 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        onKeyDown={(event) =>
          handleKeyDownOnSubTask({ [taskCardId]: taskCard }, {}, taskCardId, subTask, event, dispatch, boardId)
        }
        onChange={(event) => changeSubTaskTitle(subTask.id, event.target.value, dispatch, boardId)}
      />
    </div>
  )
}
