import { produce } from 'immer'
import { useContext } from 'react'
import { Draggable } from '@hello-pangea/dnd'

import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { ContextMenu, ContextMenuTrigger } from '@/components/ui/context-menu'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

import { SubTasks } from './SubTasks'
import { PlannerContext } from '../TaskColumns'
import { TaskCardDialog } from './TaskCardDialog'
import { TaskCardContextMenu } from './TaskCardContextMenu'

type TaskCardProps = {
  index: number
  taskCardId: string
  columnId: string
}

export const TaskCard = ({ index, taskCardId, columnId }: TaskCardProps) => {
  const { data, setData } = useContext(PlannerContext)!
  const task = data.taskCards[taskCardId]
  return (
    <Draggable draggableId={taskCardId} index={index}>
      {(provided, snapshot) => (
        <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
          <ContextMenu>
            <TaskCardContextMenu columnId={columnId} taskCardId={taskCardId} />
            <ContextMenuTrigger>
              <Dialog>
                <TaskCardDialog id={taskCardId} />
                <DialogTrigger asChild>
                  <Card className={`border-stone-200 mb-2`}>
                    <CardHeader className='p-4'>
                      <CardTitle>{task.title}</CardTitle>
                      <CardDescription>{task.content}</CardDescription>
                    </CardHeader>
                    {task.subTasks.length > 0 && (
                      <CardContent className='flex flex-col gap-2'>
                        <SubTasks taskCardId={taskCardId} />
                      </CardContent>
                    )}
                    <CardFooter className='flex justify-between'>
                      <Checkbox
                        checked={task.checked}
                        onClick={(event) => {
                          event.preventDefault() // Neede to prevent dialog from triggering
                          const isChecked = (event.target as HTMLButtonElement).getAttribute('data-state') === 'checked'
                          setData(
                            produce((draft) => {
                              draft.taskCards[taskCardId].checked = !isChecked
                            })
                          )
                        }}
                      />
                      <p className='text-sm text-right text-emerald-500'># {task.category}</p>
                    </CardFooter>
                  </Card>
                </DialogTrigger>
              </Dialog>
            </ContextMenuTrigger>
          </ContextMenu>
        </div>
      )}
    </Draggable>
  )
}
