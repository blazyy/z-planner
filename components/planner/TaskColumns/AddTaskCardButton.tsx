import { Card, CardHeader } from '@/components/ui/card'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { TaskCardsType } from '@/hooks/Planner/types'
import { PlusCircle } from 'lucide-react'

const getTotalTaskCardsCount = (taskCards: TaskCardsType): number => {
  return Object.keys(taskCards).length
}

type AddTaskCardButtonProps = {
  columnId: string
}

export const AddTaskCardButton = ({ columnId }: AddTaskCardButtonProps) => {
  const { taskCards, dataEnteredInTaskCardBeingInitialized } = usePlanner()!
  const dispatch = usePlannerDispatch()!
  return (
    <Card
      className='mb-2 cursor-pointer'
      onClick={() => {
        // Only allow an initializing task card to be added in an existing task card doesn't already exist,
        // or if it exists and does not have any info entered.
        if (!dataEnteredInTaskCardBeingInitialized) {
          const currentTaskCardsCount = getTotalTaskCardsCount(taskCards)
          const newTaskCardId = `taskcard-${currentTaskCardsCount + 1}`
          dispatch({
            type: 'newTaskCardInitialized',
            payload: {
              taskCardId: newTaskCardId,
              columnId,
              isHighlighted: false,
            },
          })
        } else {
          dispatch({
            type: 'taskCardBeingInitializedHighlightStatusChange',
            payload: true,
          })
        }
      }}
    >
      <CardHeader className='p-2'>
        <div className=' flex flex-row align-center gap-2'>
          <PlusCircle className='text-gray-400' />
          <div className='text-gray-500'>Add task</div>
        </div>
      </CardHeader>
    </Card>
  )
}
