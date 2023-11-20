import { Checkbox } from '@/components/ui/checkbox'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'

type SubTasksProps = {
  taskCardId: string
}

export const SubTasks = ({ taskCardId }: SubTasksProps) => {
  const plannerDispatch = usePlannerDispatch()!
  const { taskCards, subTasks } = usePlanner()!
  const subTasksUnderTaskCard = taskCards[taskCardId].subTasks.map((subTaskId) => subTasks[subTaskId])

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
              plannerDispatch({
                type: 'subTasksCheckedStatusChanged',
                payload: {
                  subTaskId: subTask.id,
                  isChecked: !isChecked,
                },
              })
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
