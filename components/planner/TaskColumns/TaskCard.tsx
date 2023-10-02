import { produce } from 'immer'
import { useContext } from 'react'
import { Draggable } from '@hello-pangea/dnd'

import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { PlannerContext } from './TaskColumns'
import { SubTask } from './SubTask'

type TaskCardProps = {
  index: number
  id: string
}

export const TaskCard = ({ index, id }: TaskCardProps) => {
  const { data, setData } = useContext(PlannerContext)!
  const task = data.taskCards[id]
  const { title, category, content, checked } = task
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
          <Card
            className={`border-stone-400 mb-2 ${snapshot.isDragging ? 'border-4 border-dashed border-teal-400' : ''}`}
          >
            <CardHeader>
              <div className='flex flex-row justify-between'>
                <CardTitle>{title}</CardTitle>
              </div>
              <CardDescription>{content}</CardDescription>
            </CardHeader>
            {task.subTasks.length > 0 && (
              <CardContent className='flex flex-col gap-2'>
                {task.subTasks.map((subTaskId, index) => (
                  <SubTask key={subTaskId} id={subTaskId} index={index} />
                ))}
              </CardContent>
            )}
            <CardFooter className='flex justify-between'>
              <Checkbox
                checked={checked}
                onCheckedChange={(isChecked) => {
                  setData(
                    produce((draft) => {
                      draft.taskCards[id].checked = Boolean(isChecked)
                    })
                  )
                }}
              />
              <p className='text-sm text-right text-emerald-500'>{category}</p>
            </CardFooter>
          </Card>
        </div>
      )}
    </Draggable>
  )
}
