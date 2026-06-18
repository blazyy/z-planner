import { Draggable } from '@hello-pangea/dnd'
import { memo } from 'react'
import { toast } from 'sonner'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ContextMenu, ContextMenuTrigger } from '@/components/ui/context-menu'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { usePlannerDispatch, usePlannerSelector } from '@/hooks/Planner/Planner'
import { cn } from '@/lib/utils'
import changeCardCheckedStatus from '@/utils/plannerUtils/cardUtils/changeCardCheckedStatus'

import { CategoryBadge } from './CategoryBadge'
import { ProgressBar } from './ProgressBar'
import { SubTasks } from './SubTasks'
import { TaskCardContextMenu } from './TaskCardContextMenu/TaskCardContextMenu'
import { TaskCardDialog } from './TaskCardDialog/TaskCardDialog'

type TaskCardProps = {
  index: number
  boardId: string
  columnId: string
  taskCardId: string
  isDragDisabled: boolean
}

type TaskCardWrapperProps = {
  index: number
  boardId: string
  columnId: string
  taskCardId: string
  isDragDisabled: boolean
  children: (isDragging: boolean) => JSX.Element
}

// children is a render function so that snapshot.isDragging (only available inside the Draggable
// render prop) can be delivered to the card markup without going through global state.
const TaskCardWrapper = ({ index, boardId, columnId, taskCardId, isDragDisabled, children }: TaskCardWrapperProps) => {
  return (
    <Draggable draggableId={taskCardId} index={index} isDragDisabled={isDragDisabled}>
      {(provided, snapshot) => (
        <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef} className='my-1 w-full'>
          <Dialog>
            <ContextMenu>
              <TaskCardContextMenu columnId={columnId} taskCardId={taskCardId} />
              <ContextMenuTrigger>
                {/* Dialog is the one that shows when you click on a card. This allows you to edit a card's information*/}
                <DialogTrigger asChild>{children(snapshot.isDragging)}</DialogTrigger>
              </ContextMenuTrigger>
            </ContextMenu>
            <TaskCardDialog boardId={boardId} columnId={columnId} id={taskCardId} />
          </Dialog>
        </div>
      )}
    </Draggable>
  )
}

export const TaskCard = memo(function TaskCard({
  index,
  boardId,
  columnId,
  taskCardId,
  isDragDisabled,
}: TaskCardProps) {
  const dispatch = usePlannerDispatch()
  // Subscribe to just THIS card and THIS column, so mutating another card or
  // column never re-renders this one (TaskCard is memoized).
  const task = usePlannerSelector((s) => s.taskCards[taskCardId])
  const column = usePlannerSelector((s) => s.columns[columnId])

  return (
    <TaskCardWrapper
      index={index}
      boardId={boardId}
      columnId={columnId}
      taskCardId={taskCardId}
      isDragDisabled={isDragDisabled}
    >
      {(isDragging) => (
        <Card
          // DialogTrigger asChild attaches the open handler here; the card itself
          // is a div, so it needs button semantics to be keyboard-openable.
          role='button'
          tabIndex={0}
          aria-label={`Open task "${task.title}"`}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              event.currentTarget.click()
            }
          }}
          className={cn(
            isDragging ? 'backdrop-blur-sm bg-card/70' : '',
            task.status === 'completed' ? 'opacity-50' : ''
          )}
        >
          <CardHeader className='p-4'>
            <div className='flex flex-col justify-between items-start'>
              <CardTitle className='text-xl'>{task.title}</CardTitle>
            </div>
          </CardHeader>
          {task.subTasks.length > 0 && (
            <CardContent className='flex flex-col gap-2 px-4'>
              <SubTasks taskCardId={task.id} />
              <ProgressBar taskCardId={taskCardId} />
            </CardContent>
          )}
          <CardFooter className='flex justify-between px-4 pb-4'>
            <div className='flex items-center gap-2'>
              <Checkbox
                className='rounded-xl w-5 h-5'
                checked={task.status === 'completed'}
                onClick={(event) => {
                  event.preventDefault() // Needed to prevent dialog from triggering
                  const isChecked = (event.target as HTMLButtonElement).getAttribute('data-state') === 'checked'
                  if (!isChecked) {
                    // Means the card was just checked, condition might be confusing
                    toast.success('Task marked as complete.')
                  } else {
                    toast.info('Task marked as incomplete.')
                  }
                  changeCardCheckedStatus(columnId, taskCardId, !isChecked, column.taskCards, dispatch)
                }}
              />
            </div>
            <CategoryBadge boardId={boardId} taskCardId={taskCardId} />
          </CardFooter>
        </Card>
      )}
    </TaskCardWrapper>
  )
})
