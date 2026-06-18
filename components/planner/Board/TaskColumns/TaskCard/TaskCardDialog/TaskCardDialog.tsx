import { useEffect } from 'react'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { usePlannerDispatch, usePlannerSelector } from '@/hooks/Planner/Planner'
import { flushDebouncedMutation } from '@/utils/plannerUtils/apiClient'
import changeCardCheckedStatus from '@/utils/plannerUtils/cardUtils/changeCardCheckedStatus'
import changeCardContent from '@/utils/plannerUtils/cardUtils/changeCardContent'
import changeCardTitle from '@/utils/plannerUtils/cardUtils/changeCardTitle'

import { CategoryBadge } from '../CategoryBadge'
import { EditableSubTasks } from './EditableSubTasks/EditableSubTasks'

type TaskCardDialogProps = {
  columnId: string
  boardId: string
  id: string
}

export const TaskCardDialog = ({ boardId, columnId, id }: TaskCardDialogProps) => {
  const dispatch = usePlannerDispatch()!
  // Subscribe to just this card + its column so an edit to another card never
  // re-renders this dialog.
  const task = usePlannerSelector((s) => s.taskCards[id])
  const column = usePlannerSelector((s) => s.columns[columnId])

  /*
   * Closing the dialog unmounts this content (Radix portals it without
   * forceMount), so the cleanup is our close hook. Title/content edits are
   * saved through trailing-edge debounced PATCHes keyed per card; if the user
   * types and closes before the timer fires, that last edit's request never
   * goes out. Flushing both keys here fires the pending PATCH immediately. The
   * optimistic value already lives in the planner store (the dispatch ran on
   * keystroke), so the flushed request carries the latest value.
   */
  useEffect(() => {
    return () => {
      flushDebouncedMutation(`card-title:${id}`)
      flushDebouncedMutation(`card-content:${id}`)
    }
  }, [id])

  return (
    <DialogContent className='p-0'>
      {/* Screen-reader-only title: Radix warns without one, and assistive tech
          announces nothing when the dialog opens. */}
      <DialogTitle className='sr-only'>{task.title || 'Task card'}</DialogTitle>
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
                  checked={task.status === 'completed'}
                  onCheckedChange={(isChecked) =>
                    changeCardCheckedStatus(columnId, id, Boolean(isChecked), column.taskCards, dispatch, boardId)
                  }
                />
                <Textarea
                  value={task.title}
                  className='items-center p-0 border-none h-[35px] text-2xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y'
                  onChange={(event) => changeCardTitle(id, event.target.value, dispatch, boardId)}
                />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-6 px-2'>
          <EditableSubTasks boardId={boardId} taskCardId={id} />
          <Separator />
          <Textarea
            placeholder='Notes...'
            value={task.content}
            className='bg-neutral-100 dark:bg-neutral-800 m-1 min-h-fit focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y'
            onChange={(event) => changeCardContent(id, event.target.value, dispatch, boardId)}
          />
        </CardContent>
        <CardFooter className='flex justify-between'></CardFooter>
      </Card>
    </DialogContent>
  )
}
