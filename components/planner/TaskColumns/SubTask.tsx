import { useContext } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { PlannerContext } from './TaskColumns'
import { produce } from 'immer'

type SubTaskProps = {
  id: string
  index: number
}

export const SubTask = ({ id, index }: SubTaskProps) => {
  const { data, setData } = useContext(PlannerContext)!
  const subTask = data.subTasks[id]
  const checkBoxId = `${id}-${index}`
  return (
    <div key={checkBoxId} className='flex gap-2 items-center'>
      <Checkbox
        id={checkBoxId}
        className='text-gray-500'
        checked={subTask.checked}
        onCheckedChange={(isChecked) => {
          setData(
            produce((draft) => {
              draft.subTasks[id].checked = Boolean(isChecked)
            })
          )
        }}
      />
      <label htmlFor={checkBoxId} className={`text-sm text-gray-500 ${subTask.checked ? 'line-through' : ''}`}>
        {subTask.title}
      </label>
    </div>
  )
}
