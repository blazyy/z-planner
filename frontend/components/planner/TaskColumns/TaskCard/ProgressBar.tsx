import { Progress } from '@/components/ui/progress'
import { usePlanner } from '@/hooks/Planner/Planner'

type ProgressBarProps = {
  taskCardId: string
}

export const ProgressBar = ({ taskCardId }: ProgressBarProps) => {
  const { subTasks, taskCards } = usePlanner()
  const subTaskObjects = taskCards[taskCardId].subTasks.map((subTaskId) => subTasks[subTaskId])
  const numCompleteSubTasks = subTaskObjects.filter((subTask) => subTask.checked).length
  const numTotalSubTasks = subTaskObjects.length
  const progressPercent = (numCompleteSubTasks / numTotalSubTasks) * 100
  return (
    <div className='flex gap-2 text-gray-500 items-center'>
      <span className='text-xs'>Progress</span>
      <Progress className='h-2' value={progressPercent} />
      <span className='text-xs'>
        ({numCompleteSubTasks}/{numTotalSubTasks})
      </span>
    </div>
  )
}
