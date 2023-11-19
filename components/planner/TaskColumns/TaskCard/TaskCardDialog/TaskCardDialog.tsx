import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { DialogContent } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { CategoryBadge } from '../CategoryBadge'
import { EditableSubTasks } from './EditableSubTasks/EditableSubTasks'

type TaskCardDialogProps = {
  id: string
}

export const TaskCardDialog = ({ id }: TaskCardDialogProps) => {
  const plannerDispatch = usePlannerDispatch()!
  const { data } = usePlanner()!
  const task = data.taskCards[id]
  return (
    <DialogContent className='p-0'>
      <Card>
        <CardHeader className='p-4'>
          <CardTitle>
            <Textarea
              value={task.title}
              className='p-3 min-h-fit text-2xl border-2 focus-visible:ring-0 focus-visible:ring-transparent resize-y'
              onChange={(event) => {
                plannerDispatch({
                  type: 'taskCardTitleChanged',
                  payload: {
                    taskCardId: id,
                    newTitle: event.target.value,
                  },
                })
              }}
            />
          </CardTitle>
          <CardDescription className='m-0'>
            <Textarea
              value={task.content}
              className='p-3 min-h-fit border-2 focus-visible:ring-0 focus-visible:ring-transparent resize-y'
              onChange={(event) => {
                plannerDispatch({
                  type: 'taskCardContentChanged',
                  payload: {
                    taskCardId: id,
                    newContent: event.target.value,
                  },
                })
              }}
            />
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-2 px-2'>
          <EditableSubTasks taskCardId={id} />
        </CardContent>
        <CardFooter className='flex justify-between'>
          <CategoryBadge taskCardId={id} />
          <Checkbox
            className='h-5 w-5'
            checked={task.checked}
            onCheckedChange={(isChecked) => {
              plannerDispatch({
                type: 'taskCardCheckedStatusChanged',
                payload: {
                  taskCardId: id,
                  isChecked: Boolean(isChecked),
                },
              })
            }}
          />
        </CardFooter>
      </Card>
    </DialogContent>
  )
}
