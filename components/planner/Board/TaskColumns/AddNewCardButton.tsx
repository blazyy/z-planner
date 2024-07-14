import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { NANOID } from '@/constants/constants'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { useEffect } from 'react'
import { FaPlus } from 'react-icons/fa6'

export const AddNewCardButton = ({ columnId }: { columnId: string }) => {
  const { taskCardBeingInitialized, dataEnteredInTaskCardBeingInitialized } = usePlanner()
  const dispatch = usePlannerDispatch()!

  useEffect(() => {
    if (taskCardBeingInitialized) {
      document.getElementById('taskCardTitleTextInput')?.focus()
    }
  }, [taskCardBeingInitialized])

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger>
          <FaPlus
            className='text-gray-400'
            onClick={() => {
              // Only allow an initializing task card to be added in an existing task card doesn't already exist,
              // or if it exists and does not have any info entered and the add button is clicked from another
              // column
              if (
                !taskCardBeingInitialized ||
                (taskCardBeingInitialized &&
                  !dataEnteredInTaskCardBeingInitialized &&
                  taskCardBeingInitialized.columnId !== columnId)
              ) {
                const newTaskCardId = NANOID()
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
          />
        </TooltipTrigger>
        <TooltipContent>Add new card</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
