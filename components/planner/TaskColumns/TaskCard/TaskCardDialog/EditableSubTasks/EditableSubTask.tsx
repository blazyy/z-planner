import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { SubTaskInfoType } from '@/hooks/Planner/types'
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
  const { data, isSubTaskBeingDragged } = usePlanner()!
  const [showDragHandle, setShowDragHandle] = useState(isSubTaskBeingDragged)
  const dispatch = usePlannerDispatch()!
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
          dispatch({
            type: 'subTasksCheckedStatusChanged',
            payload: {
              subTaskId: subTask.id,
              isChecked: Boolean(isChecked),
            },
          })
        }}
      />
      <Input
        autoFocus
        id={subTask.id}
        type='text'
        value={subTask.title}
        className='h-1 my-1 text-gray-500 border-none focus-visible:ring-0 focus-visible:ring-transparent'
        onKeyDown={(event) => handleKeyDownOnSubTask(event, data, dispatch, taskCardId, subTask)}
        onChange={(event) => {
          dispatch({
            type: 'subTaskTitleChanged',
            payload: {
              subTaskId: subTask.id,
              newTitle: event.target.value,
            },
          })
        }}
      />
    </div>
  )
}
