import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { Card, CardHeader } from '@/components/ui/card'
import { PlusCircle } from 'lucide-react'
import { useContext } from 'react'
import { PlannerContext, PlannerDataType } from '../Planner'

const getTotalTaskCardsCount = (data: PlannerDataType): number => {
  return Object.keys(data.taskCards).length
}

type AddTaskCardButtonProps = {
  columnId: string
}

export const AddTaskCardButton = ({ columnId }: AddTaskCardButtonProps) => {
  const { data } = useAppSelector((state) => state.planner)
  const { setTaskCardBeingInitialized } = useContext(PlannerContext)!
  return (
    <Card
      className='mb-2 cursor-pointer'
      onClick={() => {
        const currentTaskCardsCount = getTotalTaskCardsCount(data)
        const newTaskCardId = `taskcard-${currentTaskCardsCount + 1}`
        setTaskCardBeingInitialized({
          taskCardId: newTaskCardId,
          columnId,
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
