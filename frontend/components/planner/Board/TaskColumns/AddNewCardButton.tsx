import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { FaPlus } from 'react-icons/fa6'

import { COLUMN_ACTION_ICON_COLOR } from './ColumnHeader'
export const AddNewCardButton = ({ columnId }: { columnId: string }) => {
  const { taskCardBeingInitialized, dataEnteredInTaskCardBeingInitialized } = usePlanner()
  const dispatch = usePlannerDispatch()!
  return (
    <FaPlus
      className={`${COLUMN_ACTION_ICON_COLOR}`}
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
          const newTaskCardId = crypto.randomUUID()
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
  )
}
