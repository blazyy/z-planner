import { Plus } from 'lucide-react'
import { memo, useEffect } from 'react'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { NANOID } from '@/constants/constants'
import { usePlannerEphemeral, usePlannerEphemeralDispatch } from '@/hooks/Planner/Planner'

// Sole prop is columnId (stable string); memo so it doesn't re-render with its
// parent column header on unrelated changes.
export const AddNewCardButton = memo(function AddNewCardButton({ columnId }: { columnId: string }) {
  const { taskCardBeingInitialized, dataEnteredInTaskCardBeingInitialized } = usePlannerEphemeral()
  const dispatch = usePlannerEphemeralDispatch()!

  useEffect(() => {
    if (taskCardBeingInitialized) {
      document.getElementById('taskCardTitleTextInput')?.focus()
    }
  }, [taskCardBeingInitialized])

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        {/* TooltipTrigger renders a real <button>; the click handler lives on it
            (not the svg) so the action is reachable by keyboard. */}
        <TooltipTrigger
          aria-label='Add new card'
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
        >
          <Plus className='text-gray-400 dark:text-gray-500' size='1em' />
        </TooltipTrigger>
        <TooltipContent>Add new card</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})
