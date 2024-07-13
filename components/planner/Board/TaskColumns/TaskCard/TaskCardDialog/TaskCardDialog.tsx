import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { DialogContent } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { cn } from '@/lib/utils'
import changeCardCheckedStatus from '@/utils/plannerUtils/cardUtils/changeCardCheckedStatus'
import changeCardContent from '@/utils/plannerUtils/cardUtils/changeCardContent'
import changeCardTitle from '@/utils/plannerUtils/cardUtils/changeCardTitle'
import { useAuth } from '@clerk/nextjs'
import { Quicksand } from 'next/font/google'
import { CategoryBadge } from '../CategoryBadge'
import { EditableSubTasks } from './EditableSubTasks/EditableSubTasks'

const quicksand = Quicksand({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

type TaskCardDialogProps = {
  columnId: string
  boardId: string
  id: string
}

export const TaskCardDialog = ({ boardId, columnId, id }: TaskCardDialogProps) => {
  const dispatch = usePlannerDispatch()!
  const { getToken } = useAuth()
  const { taskCards } = usePlanner()
  const task = taskCards[id]
  return (
    <DialogContent className={cn(quicksand.className, 'p-0')}>
      <Card className='p-2'>
        <CardHeader className='gap-2 pb-0 pl-7'>
          <div className='flex gap-2'>
            <CategoryBadge boardId={boardId} taskCardId={id} />
          </div>
          <CardTitle>
            <div className='flex flex-col gap-4'>
              <div className='flex items-center gap-2'>
                <Checkbox
                  className='w-5 h-5'
                  checked={task.checked}
                  onCheckedChange={(isChecked) =>
                    changeCardCheckedStatus(columnId, id, Boolean(isChecked), dispatch, getToken)
                  }
                />
                <Textarea
                  value={task.title}
                  className='items-center p-0 border-none h-[35px] text-2xl focus-visible:ring-0 focus-visible:ring-transparent resize-y'
                  onChange={(event) => changeCardTitle(id, event.target.value, dispatch, getToken)}
                />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-6 px-2'>
          <EditableSubTasks taskCardId={id} />
          <Separator />
          <Textarea
            placeholder='Notes...'
            value={task.content}
            className='bg-neutral-100 m-1 min-h-fit focus-visible:ring-0 focus-visible:ring-transparent resize-y'
            onChange={(event) => changeCardContent(id, event.target.value, dispatch, getToken)}
          />
        </CardContent>
        <CardFooter className='flex justify-between'>{/* <CategoryBadge taskCardId={id} /> */}</CardFooter>
      </Card>
    </DialogContent>
  )
}
