import { Card, CardContent } from '@/components/ui/card'
import { usePlanner } from '@/hooks/Planner/Planner'
import { Draggable } from '@hello-pangea/dnd'

type ScheduledTaskCardProps = {
  taskCardId: string
  index: number
}

export const ScheduledTaskCard = ({ taskCardId, index }: ScheduledTaskCardProps) => {
  const { taskCards } = usePlanner()
  const task = taskCards[taskCardId]
  return (
    <Draggable draggableId={`scheduled-${taskCardId}`} index={index}>
      {(provided) => (
        <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
          <Card>
            <CardContent className='p-1 text-center'>{task.title}</CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  )
}
