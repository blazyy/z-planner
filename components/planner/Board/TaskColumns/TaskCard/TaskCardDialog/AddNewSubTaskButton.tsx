import { GripVertical, PlusCircle } from 'lucide-react'
import { useState } from 'react'

import { usePlanner, usePlannerDispatch, usePlannerEphemeral } from '@/hooks/Planner/Planner'
import { addNewSubTaskOnButtonClick } from '@/utils/plannerUtils/subTaskUtils/addNewSubTaskToCard'

type AddNewSubTaskButtonProps = {
  taskCardId: string
}

export const AddNewSubTaskButton = ({ taskCardId }: AddNewSubTaskButtonProps) => {
  const dispatch = usePlannerDispatch()
  const [isHoveringOver, setIsHoveringOver] = useState(false)
  const { taskCards } = usePlanner()
  const { isSubTaskBeingDragged } = usePlannerEphemeral()

  return (
    <button
      type='button'
      aria-label='Add subtask'
      className='flex items-center gap-2 mt-1 hover:cursor-pointer'
      onMouseEnter={() => setIsHoveringOver(true)}
      onMouseLeave={() => setIsHoveringOver(false)}
      onClick={() => addNewSubTaskOnButtonClick(taskCards[taskCardId], dispatch)}
    >
      <GripVertical size={12} className='invisible' />
      <PlusCircle
        size={20}
        className={`${isHoveringOver && !isSubTaskBeingDragged ? 'text-blue-500' : 'text-gray-400'}`}
      />
      <span className={`ml-2 text-sm ${isHoveringOver && !isSubTaskBeingDragged ? 'text-blue-500' : 'text-gray-400'}`}>
        Add subtask
      </span>
    </button>
  )
}
