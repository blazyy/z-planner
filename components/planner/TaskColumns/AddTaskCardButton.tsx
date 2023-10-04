import { useContext } from 'react'

import { PlusCircle } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/card'

import { PlannerContext, PlannerDataType } from './TaskColumns'

const getTotalTaskCardsCount = (data: PlannerDataType): number => {
  return Object.keys(data.taskCards).length
}

type AddTaskCardButtonProps = {
  columnId: string
}

export const AddTaskCardButton = ({ columnId }: AddTaskCardButtonProps) => {
  const { data, setTaskCardBeingInitializedInfo } = useContext(PlannerContext)!
  return (
    <Card
      className='mb-2 cursor-pointer'
      onClick={() => {
        const currentTaskCardsCount = getTotalTaskCardsCount(data)
        const newTaskCardId = `taskcard-${currentTaskCardsCount + 1}`
        setTaskCardBeingInitializedInfo({
          taskCardId: newTaskCardId,
          columnId: columnId,
        })
      }}
    >
      <CardHeader className='p-3'>
        <div className=' flex flex-row align-center gap-2'>
          <PlusCircle className='text-gray-400' />
          <div className='text-gray-500'>Add task</div>
        </div>
      </CardHeader>
    </Card>
  )
}
