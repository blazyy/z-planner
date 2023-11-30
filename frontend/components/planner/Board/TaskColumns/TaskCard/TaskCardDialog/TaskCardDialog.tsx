import changeCardCheckedStatus from '@/app/utils/plannerUtils/cardUtils/changeCardCheckedStatus'
import changeCardContent from '@/app/utils/plannerUtils/cardUtils/changeCardContent'
import changeCardTitle from '@/app/utils/plannerUtils/cardUtils/changeCardTitle'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { DialogContent } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { useErrorBoundary } from 'react-error-boundary'
import { CategoryBadge } from '../CategoryBadge'
import { DueDateIndicator } from '../DueDateIndicator'
import { EditableSubTasks } from './EditableSubTasks/EditableSubTasks'

type TaskCardDialogProps = {
  id: string
}

export const TaskCardDialog = ({ id }: TaskCardDialogProps) => {
  const { showBoundary } = useErrorBoundary()
  const dispatch = usePlannerDispatch()!
  const { taskCards } = usePlanner()
  const task = taskCards[id]
  return (
    <DialogContent className='p-0'>
      <Card className='border-2 border-gray-400 p-2'>
        <CardHeader className='pb-0 pl-7 gap-2'>
          <div className='flex gap-2'>
            <CategoryBadge taskCardId={id} />
            <DueDateIndicator />
          </div>
          <CardTitle>
            <div className='flex flex-col gap-4'>
              <div className='flex items-center gap-2'>
                <Checkbox
                  className='h-5 w-5'
                  checked={task.checked}
                  onCheckedChange={(isChecked) =>
                    changeCardCheckedStatus(id, Boolean(isChecked), dispatch, showBoundary)
                  }
                />
                <Textarea
                  value={task.title}
                  className='h-[35px] border-none p-0 items-center text-2xl focus-visible:ring-0 focus-visible:ring-transparent resize-y'
                  onChange={(event) => changeCardTitle(id, event.target.value, dispatch, showBoundary)}
                />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-2 px-2'>
          <EditableSubTasks taskCardId={id} />
          <CardDescription className='m-0'>
            <Textarea
              placeholder='Notes...'
              value={task.content}
              className='m-1 bg-neutral-200 min-h-fit focus-visible:ring-0 focus-visible:ring-transparent resize-y'
              onChange={(event) => changeCardContent(id, event.target.value, dispatch, showBoundary)}
            />
          </CardDescription>
        </CardContent>
        <CardFooter className='flex justify-between'>{/* <CategoryBadge taskCardId={id} /> */}</CardFooter>
      </Card>
    </DialogContent>
  )
}
