import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { newSubTaskAddedOnButtonClick } from '@/app/store/planner/reducer'

import { PlusCircle, GripVertical } from 'lucide-react'

import { PlannerDataType } from '../../TaskColumns'

type AddNewSubTaskButtonProps = {
  taskCardId: string
}

export const getTotalSubTasksCount = (data: PlannerDataType): number => {
  return Object.keys(data.subTasks).length
}

export const AddNewSubTaskButton = ({ taskCardId }: AddNewSubTaskButtonProps) => {
  const dispatch = useAppDispatch()
  const { data } = useAppSelector((state) => state.planner)
  const numTotalNumSubTasks = getTotalSubTasksCount(data)
  const newSubTaskId: string = `$subtask-${numTotalNumSubTasks + 1}`
  const [isHoveringOver, setIsHoveringOver] = useState(false)

  return (
    <div
      className='mt-1 flex gap-2 items-center hover:cursor-pointer'
      onMouseEnter={() => setIsHoveringOver(true)}
      onMouseLeave={() => setIsHoveringOver(false)}
      onClick={() =>
        dispatch(
          newSubTaskAddedOnButtonClick({
            taskCardId,
            newSubTaskId,
          })
        )
      }
    >
      <GripVertical size={12} className='invisible' />
      <PlusCircle size={20} className={`${isHoveringOver ? 'text-blue-500' : 'text-gray-400'}`} />
      <span className={`ml-2 text-sm ${isHoveringOver ? 'text-blue-500' : 'text-gray-400'}`}>Add subtask</span>
    </div>
  )
}
