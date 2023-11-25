import changeSubTaskCheckedStatus from '@/app/utils/plannerUtils/subTaskUtils/changeSubTaskCheckedStatus'
import { Checkbox } from '@/components/ui/checkbox'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { useErrorBoundary } from 'react-error-boundary'

type SubTasksProps = {
  taskCardId: string
}

export const SubTasks = ({ taskCardId }: SubTasksProps) => {
  const dispatch = usePlannerDispatch()
  const { taskCards, subTasks } = usePlanner()
  const subTasksUnderTaskCard = taskCards[taskCardId].subTasks.map((subTaskId) => subTasks[subTaskId])
  const { showBoundary } = useErrorBoundary()

  return (
    <div>
      {subTasksUnderTaskCard.map((subTask, index) => (
        <div key={subTask.id} className='flex gap-2 items-center'>
          <Checkbox
            id={`${index}`}
            className='text-gray-500'
            checked={subTask.checked}
            onClick={(event) => {
              event.preventDefault() // Neede to prevent dialog from triggering
              const isChecked = (event.target as HTMLButtonElement).getAttribute('data-state') === 'checked'
              changeSubTaskCheckedStatus(subTask.id, !isChecked, dispatch, showBoundary)
            }}
          />
          <label htmlFor={subTask.id} className='text-sm text-gray-500'>
            {subTask.title}
          </label>
        </div>
      ))}
    </div>
  )
}
