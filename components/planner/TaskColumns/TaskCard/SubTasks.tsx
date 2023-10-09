import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { subTasksCheckedStatusChanged } from '@/app/store/planner/reducer'
import { Checkbox } from '@/components/ui/checkbox'

type SubTasksProps = {
  taskCardId: string
}

export const SubTasks = ({ taskCardId }: SubTasksProps) => {
  const dispatch = useAppDispatch()
  const { data } = useAppSelector((state) => state.planner)
  const subTasks = data.taskCards[taskCardId].subTasks.map((subTaskId) => data.subTasks[subTaskId])

  return (
    <div>
      {subTasks.map((subTask, index) => (
        <div key={subTask.id} className='flex gap-2 items-center'>
          <Checkbox
            id={`${index}`}
            className='text-gray-500'
            checked={subTask.checked}
            onClick={(event) => {
              event.preventDefault() // Neede to prevent dialog from triggering
              const isChecked = (event.target as HTMLButtonElement).getAttribute('data-state') === 'checked'
              dispatch(
                subTasksCheckedStatusChanged({
                  subTaskId: subTask.id,
                  isChecked: !isChecked,
                })
              )
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
