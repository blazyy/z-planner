import { GripVertical, PlusCircle } from 'lucide-react'
import { useState } from 'react'

import { usePlannerDispatch, usePlannerEphemeral, usePlannerSelector } from '@/hooks/Planner/Planner'
import { addNewSubTaskOnButtonClick } from '@/utils/plannerUtils/subTaskUtils/addNewSubTaskToCard'

type AddNewSubTaskButtonProps = {
  boardId: string
  taskCardId: string
}

export const AddNewSubTaskButton = ({ boardId, taskCardId }: AddNewSubTaskButtonProps) => {
  const dispatch = usePlannerDispatch()
  const [isHoveringOver, setIsHoveringOver] = useState(false)
  const taskCard = usePlannerSelector((s) => s.taskCards[taskCardId])
  const { isSubTaskBeingDragged } = usePlannerEphemeral()

  return (
    <button
      type='button'
      aria-label='Add subtask'
      className='flex items-center gap-2 mt-1 hover:cursor-pointer'
      onMouseEnter={() => setIsHoveringOver(true)}
      onMouseLeave={() => setIsHoveringOver(false)}
      onClick={() => addNewSubTaskOnButtonClick(taskCard, dispatch, boardId)}
    >
      <GripVertical size={12} className='invisible' />
      <PlusCircle
        size={20}
        className={`${isHoveringOver && !isSubTaskBeingDragged ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`}
      />
      <span
        className={`ml-2 text-sm ${isHoveringOver && !isSubTaskBeingDragged ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`}
      >
        Add subtask
      </span>
    </button>
  )
}
