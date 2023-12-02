import { usePlanner } from '@/hooks/Planner/Planner'
import { Droppable } from '@hello-pangea/dnd'
import { ScheduledTaskCard } from './ScheduledTaskCard'

export const CalendarColumn = () => {
  const { scheduledTaskCards } = usePlanner()
  return (
    <Droppable droppableId='calendar' type='card'>
      {(provided, snapshot) => (
        <div
          className={`flex flex-col w-80 p-3 bg-pink-200 items-center ${
            snapshot.isDraggingOver ? 'bg-pink-500' : 'bg-pink-200'
          }`}
          {...provided.droppableProps}
          ref={provided.innerRef}
        >
          {scheduledTaskCards.map((taskCardId, index) => (
            <ScheduledTaskCard key={`scheduled-${taskCardId}`} index={index} taskCardId={taskCardId} />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}
