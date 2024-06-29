import changeSubTaskCheckedStatus from '@/app/utils/plannerUtils/subTaskUtils/changeSubTaskCheckedStatus'
import changeSubTaskTitle from '@/app/utils/plannerUtils/subTaskUtils/changeSubTaskTitle'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { SubTaskInfoType } from '@/hooks/Planner/types'
import { useAuth } from '@clerk/nextjs'
import { DraggableProvided } from '@hello-pangea/dnd'
import { GripVertical } from 'lucide-react'
import { useState } from 'react'
import { handleKeyDownOnSubTask } from './utils'

type EditableSubTaskProps = {
  index: number
  provided: DraggableProvided
  taskCardId: string
  subTask: SubTaskInfoType
  isBeingDragged: boolean
}

export const EditableSubTask = ({ index, provided, taskCardId, subTask, isBeingDragged }: EditableSubTaskProps) => {
  const { isSubTaskBeingDragged, taskCards, subTasks } = usePlanner()
  const [showDragHandle, setShowDragHandle] = useState(isSubTaskBeingDragged)
  const dispatch = usePlannerDispatch()!
  const { getToken } = useAuth()
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
        onCheckedChange={(isChecked) => changeSubTaskCheckedStatus(subTask.id, Boolean(isChecked), dispatch, getToken)}
      />
      <Input
        autoFocus
        id={subTask.id}
        type='text'
        value={subTask.title}
        className='my-1 px-1 border-none h-1 text-gray-500 text-sm focus-visible:ring-0 focus-visible:ring-transparent'
        onKeyDown={(event) =>
          handleKeyDownOnSubTask(taskCards, subTasks, taskCardId, subTask, event, dispatch, getToken)
        }
        onChange={(event) => changeSubTaskTitle(subTask.id, event.target.value, dispatch, getToken)}
      />
    </div>
  )
}
