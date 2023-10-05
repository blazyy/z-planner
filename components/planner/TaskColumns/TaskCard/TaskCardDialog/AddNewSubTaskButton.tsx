import { produce } from 'immer'
import { useContext, useEffect, useState } from 'react'
import { PlusCircle, GripVertical } from 'lucide-react'

import { PlannerContext, PlannerDataType } from '../../TaskColumns'

type AddNewSubTaskButtonProps = {
  taskCardId: string
}

export const AddNewSubTaskButton = ({ taskCardId }: AddNewSubTaskButtonProps) => {
  const { data, setData } = useContext(PlannerContext)!
  const [isHoveringOver, setIsHoveringOver] = useState(false)

  const getTotalSubTasksCount = (data: PlannerDataType): number => {
    return Object.keys(data.subTasks).length
  }

  return (
    <div
      className='mt-1 flex gap-2 items-center hover:cursor-pointer'
      onMouseEnter={() => setIsHoveringOver(true)}
      onMouseLeave={() => setIsHoveringOver(false)}
      onClick={() => {
        const numTotalNumSubTasks = getTotalSubTasksCount(data)
        const newSubTaskId: string = `$subtask-${numTotalNumSubTasks + 1}`
        setData(
          produce((draft) => {
            draft.taskCards[taskCardId].subTasks.push(newSubTaskId)
            draft.subTasks[newSubTaskId] = {
              id: newSubTaskId,
              title: '',
              checked: false,
            }
          })
        )
      }}
    >
      <GripVertical size={12} className='invisible' />
      <PlusCircle size={20} className={`${isHoveringOver ? 'text-blue-500' : 'text-gray-400'}`} />
      <span className={`ml-2 text-sm ${isHoveringOver ? 'text-blue-500' : 'text-gray-400'}`}>Add subtask</span>
    </div>
  )
}
