import { memo } from 'react'

import { Progress } from '@/components/ui/progress'
import { usePlannerSelector } from '@/hooks/Planner/Planner'

type ProgressBarProps = {
  taskCardId: string
}

// Sole prop is a stable string; memo so it re-renders only when this card's
// subtask list or the subTasks map changes.
export const ProgressBar = memo(function ProgressBar({ taskCardId }: ProgressBarProps) {
  const subTaskIds = usePlannerSelector((s) => s.taskCards[taskCardId].subTasks)
  const subTasks = usePlannerSelector((s) => s.subTasks)
  const subTaskObjects = subTaskIds.map((subTaskId) => subTasks[subTaskId])
  const numCompleteSubTasks = subTaskObjects.filter((subTask) => subTask.checked).length
  const numTotalSubTasks = subTaskObjects.length
  const progressPercent = (numCompleteSubTasks / numTotalSubTasks) * 100
  return (
    <div className='flex gap-2 text-gray-500 dark:text-gray-400 items-center'>
      <span className='text-xs'>Progress</span>
      <Progress className='h-2' value={progressPercent} />
      <span className='text-xs'>
        ({numCompleteSubTasks}/{numTotalSubTasks})
      </span>
    </div>
  )
})
