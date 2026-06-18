import { Draggable } from '@hello-pangea/dnd'
import dynamic from 'next/dynamic'
import { memo, useState } from 'react'
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

// The edit dialog (+ its EditableSubTasks/Textarea subtree) is heavy and only
// needed once a card is opened. Code-split it out of the board bundle: the chunk
// is fetched on first open instead of shipping with every board load. ssr:false
// because it only renders client-side behind a click.
const TaskCardDialog = dynamic(() => import('./TaskCardDialog/TaskCardDialog').then((m) => m.TaskCardDialog), {
  ssr: false,
})

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
  // Dialog is now CONTROLLED only so we can latch "has this card ever been
  // opened". The code-split TaskCardDialog enters the React tree (and its chunk
  // is fetched) the first time the card opens, never before, keeping it out of
  // the initial board bundle. Once it has mounted, Radix's own controlled
  // open/close drives the DialogContent mount/unmount (so the close ANIMATION is
  // preserved and TaskCardDialog's flush-on-close cleanup still runs on close).
  // hasOpened never resets, so a re-open uses the already-loaded chunk.
  const [isOpen, setIsOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  return (
    <Draggable draggableId={taskCardId} index={index} isDragDisabled={isDragDisabled}>
      {(provided, snapshot) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          aria-roledescription='Draggable task card'
          className='my-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background w-full'
        >
          <Dialog
            open={isOpen}
            onOpenChange={(nextOpen) => {
              if (nextOpen) {
                setHasOpened(true)
              }
              setIsOpen(nextOpen)
            }}
          >
            <ContextMenu>
              <TaskCardContextMenu boardId={boardId} columnId={columnId} taskCardId={taskCardId} />
              <ContextMenuTrigger>
                {/* Dialog is the one that shows when you click on a card. This allows you to edit a card's information*/}
                <DialogTrigger asChild>{children(snapshot.isDragging)}</DialogTrigger>
              </ContextMenuTrigger>
            </ContextMenu>
            {hasOpened && <TaskCardDialog boardId={boardId} columnId={columnId} id={taskCardId} />}
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
              <SubTasks boardId={boardId} taskCardId={task.id} />
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
                  changeCardCheckedStatus(columnId, taskCardId, !isChecked, column.taskCards, dispatch, boardId)
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
