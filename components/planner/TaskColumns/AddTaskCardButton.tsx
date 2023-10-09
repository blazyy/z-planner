import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { newTaskCardInitializationStarted } from '@/app/store/planner/reducer'
import { Card, CardHeader } from '@/components/ui/card'
import { PlusCircle } from 'lucide-react'
import { PlannerDataType } from '../Planner'

const getTotalTaskCardsCount = (data: PlannerDataType): number => {
  return Object.keys(data.taskCards).length
}

type AddTaskCardButtonProps = {
  columnId: string
}

export const AddTaskCardButton = ({ columnId }: AddTaskCardButtonProps) => {
  const { data } = useAppSelector((state) => state.planner)
  const dispatch = useAppDispatch()
  return (
    <Card
      className='mb-2 cursor-pointer'
      onClick={() => {
        const currentTaskCardsCount = getTotalTaskCardsCount(data)
        const newTaskCardId = `taskcard-${currentTaskCardsCount + 1}`
        dispatch(newTaskCardInitializationStarted({ columnId, newTaskCardId }))
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
