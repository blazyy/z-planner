import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { SubTaskInfoType } from '@/hooks/Planner/types'
import { GripVertical, PlusCircle } from 'lucide-react'
import { useState } from 'react'

type AddNewSubTaskButtonProps = {
  taskCardId: string
}

export const getTotalSubTasksCount = (subTasks: { [subTaskId: string]: SubTaskInfoType }): number => {
  return Object.keys(subTasks).length
}

export const AddNewSubTaskButton = ({ taskCardId }: AddNewSubTaskButtonProps) => {
  const dispatch = usePlannerDispatch()!
  const [isHoveringOver, setIsHoveringOver] = useState(false)
  const { subTasks, isSubTaskBeingDragged } = usePlanner()!
  const numTotalNumSubTasks = getTotalSubTasksCount(subTasks)
  const newSubTaskId: string = `$subtask-${numTotalNumSubTasks + 1}`

  return (
    <div
      className='mt-1 flex gap-2 items-center hover:cursor-pointer'
      onMouseEnter={() => setIsHoveringOver(true)}
      onMouseLeave={() => setIsHoveringOver(false)}
      onClick={() =>
        dispatch({
          type: 'newSubTaskAddedOnButtonClick',
          payload: {
            taskCardId,
            newSubTaskId,
          },
        })
      }
    >
      <GripVertical size={12} className='invisible' />
      <PlusCircle
        size={20}
        className={`${isHoveringOver && !isSubTaskBeingDragged ? 'text-blue-500' : 'text-gray-400'}`}
      />
      <span className={`ml-2 text-sm ${isHoveringOver && !isSubTaskBeingDragged ? 'text-blue-500' : 'text-gray-400'}`}>
        Add subtask
      </span>
    </div>
  )
}
