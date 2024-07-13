import { Checkbox } from '@/components/ui/checkbox'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import changeSubTaskCheckedStatus from '@/utils/plannerUtils/subTaskUtils/changeSubTaskCheckedStatus'
import { useAuth } from '@clerk/nextjs'

type SubTasksProps = {
  taskCardId: string
}

export const SubTasks = ({ taskCardId }: SubTasksProps) => {
  const { getToken } = useAuth()
  const dispatch = usePlannerDispatch()
  const { taskCards, subTasks } = usePlanner()
  const subTasksUnderTaskCard = taskCards[taskCardId].subTasks.map((subTaskId) => subTasks[subTaskId])
  const isEditable = !(taskCards[taskCardId].status === 'completed')
  return (
    <div className='flex flex-col gap-0.5'>
      {subTasksUnderTaskCard.map((subTask, index) => (
        <div key={subTask.id} className='flex items-center gap-2'>
          <Checkbox
            id={`${index}`}
            checked={subTask.checked}
            onClick={(event) => {
              if (isEditable) {
                event.preventDefault() // Neede to prevent dialog from triggering
                const isChecked = (event.target as HTMLButtonElement).getAttribute('data-state') === 'checked'
                changeSubTaskCheckedStatus(subTask.id, !isChecked, dispatch, getToken)
              }
            }}
          />
          <label htmlFor={subTask.id} className='text-gray-500 text-sm cursor-pointer'>
            {subTask.title}
          </label>
        </div>
      ))}
    </div>
  )
}
