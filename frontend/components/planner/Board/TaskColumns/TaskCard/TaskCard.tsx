import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ContextMenu, ContextMenuTrigger } from '@/components/ui/context-menu'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { cn } from '@/lib/utils'
import { useAuth } from '@clerk/nextjs'
import { Draggable } from '@hello-pangea/dnd'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { CategoryBadge } from './CategoryBadge'
import { DueDateIndicator } from './DueDateIndicator'
import { ProgressBar } from './ProgressBar'
import { SubTasks } from './SubTasks'
import { TaskCardContextMenu } from './TaskCardContextMenu/TaskCardContextMenu'
import { TaskCardDialog } from './TaskCardDialog/TaskCardDialog'

type TaskCardProps = {
  index: number
  boardId: string
  columnId: string
  taskCardId: string
}

type TaskCardWrapperProps = {
  index: number
  boardId: string
  columnId: string
  taskCardId: string
  children: JSX.Element
}

const TaskCardWrapper = ({ index, boardId, columnId, taskCardId, children }: TaskCardWrapperProps) => {
  return (
    <Draggable draggableId={taskCardId} index={index}>
      {(provided) => (
        <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef} className='my-1 w-full'>
          <Dialog>
            <ContextMenu>
              <TaskCardContextMenu boardId={boardId} columnId={columnId} taskCardId={taskCardId} />
              <ContextMenuTrigger>
                {/* Dialog is the one that shows when you click on a card. This allows you to edit a card's information*/}
                <DialogTrigger asChild>{children}</DialogTrigger>
              </ContextMenuTrigger>
            </ContextMenu>
            <TaskCardDialog boardId={boardId} id={taskCardId} />
          </Dialog>
        </div>
      )}
    </Draggable>
  )
}

export const TaskCard = ({ index, boardId, columnId, taskCardId }: TaskCardProps) => {
  // idOfCardBeingDragged is consumed from a context due to the fact that the snapshot object (which has an isDragging flag),
  // was in the wrapper component. There was no straightforward way to pass that info down to it's children (i.e. TaskCard).
  // Using ContextProvider is possible but was way too convoluted- i.e. the isDragging property wouldn't cause re-renders,
  // and thus the card wouldn't turn transparent, which is the reason why we need to know if the card is being dragged.
  const dispatch = usePlannerDispatch()
  const { taskCards, idOfCardBeingDragged } = usePlanner()
  const task = taskCards[taskCardId]
  const { getToken } = useAuth()

  const changeCardCheckedStatusMutation = useMutation({
    mutationFn: async (payload: any) => {
      const token = await getToken()
      const { taskCardId, isChecked } = payload
      return axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/cards/${taskCardId}/checked`,
        {
          isChecked,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
    },
    onMutate: async (payload) => {
      console.log('bruh', payload)
      dispatch({
        type: 'taskCardCheckedStatusChanged',
        payload: payload,
      })
    },
    onError: (err) => {
      dispatch({
        type: 'backendErrorOccurred',
      })
    },
  })

  return (
    <TaskCardWrapper index={index} boardId={boardId} columnId={columnId} taskCardId={taskCardId}>
      <Card
        className={cn(
          idOfCardBeingDragged === taskCardId ? 'backdrop-blur-sm bg-white/70' : '',
          task.checked ? 'opacity-50' : ''
        )}
      >
        <CardHeader className='p-4'>
          <div className='flex flex-col justify-between items-start'>
            <CardTitle className='text-xl'>{task.title}</CardTitle>
          </div>
          {/* <CardDescription>{task.content}</CardDescription> */}
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
              className='w-5 h-5'
              checked={task.checked}
              onClick={(event) => {
                event.preventDefault() // Needed to prevent dialog from triggering
                const isChecked = (event.target as HTMLButtonElement).getAttribute('data-state') === 'checked'
                const payload = {
                  taskCardId,
                  isChecked: !isChecked,
                }
                changeCardCheckedStatusMutation.mutate(payload)
              }}
            />
            <DueDateIndicator taskCardId={taskCardId} />
          </div>
          <CategoryBadge boardId={boardId} taskCardId={taskCardId} />
        </CardFooter>
      </Card>
    </TaskCardWrapper>
  )
}
