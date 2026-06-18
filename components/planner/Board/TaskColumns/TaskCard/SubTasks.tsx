import { memo } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { usePlannerDispatch, usePlannerSelector } from '@/hooks/Planner/Planner'
import changeSubTaskCheckedStatus from '@/utils/plannerUtils/subTaskUtils/changeSubTaskCheckedStatus'

type SubTasksProps = {
  boardId: string
  taskCardId: string
}

// Both props are stable strings; memo so it re-renders only when this card's
// subtask list / status or the subTasks map changes.
export const SubTasks = memo(function SubTasks({ boardId, taskCardId }: SubTasksProps) {
  const dispatch = usePlannerDispatch()
  const subTaskIds = usePlannerSelector((s) => s.taskCards[taskCardId].subTasks)
  const status = usePlannerSelector((s) => s.taskCards[taskCardId].status)
  const subTasks = usePlannerSelector((s) => s.subTasks)
  const subTasksUnderTaskCard = subTaskIds.map((subTaskId) => subTasks[subTaskId])
  const isEditable = !(status === 'completed')
  return (
    <div className='flex flex-col gap-0.5'>
      {subTasksUnderTaskCard.map((subTask, index) => (
        <div key={subTask.id} className='flex items-center gap-2'>
          <Checkbox
            id={`subtask-check-${subTask.id}`}
            checked={subTask.checked}
            onClick={(event) => {
              if (isEditable) {
                event.preventDefault() // Neede to prevent dialog from triggering
                const isChecked = (event.target as HTMLButtonElement).getAttribute('data-state') === 'checked'
                changeSubTaskCheckedStatus(subTask.id, !isChecked, dispatch, boardId)
              }
            }}
          />
          <label
            htmlFor={`subtask-check-${subTask.id}`}
            className='text-gray-500 dark:text-gray-400 text-sm cursor-pointer'
          >
            {subTask.title}
          </label>
        </div>
      ))}
    </div>
  )
})
