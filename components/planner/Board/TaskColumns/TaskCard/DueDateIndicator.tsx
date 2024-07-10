import { usePlanner } from '@/hooks/Planner/Planner'
import { format } from 'date-fns'
import { Clock5Icon } from 'lucide-react'

type DueDateIndicatorProps = {
  taskCardId: string
}

export const DueDateIndicator = ({ taskCardId }: DueDateIndicatorProps) => {
  const { taskCards } = usePlanner()
  const task = taskCards[taskCardId]
  if (!task.dueDate) {
    return null
  }
  return (
    <div className='flex items-center gap-2 text-slate-400 hover:text-slate-500'>
      <span className='text-xs'>{format(new Date(task.dueDate), 'MMM dd')}</span>
      <span>
        <Clock5Icon className='w-4 h-4' />
      </span>
    </div>
  )
}
