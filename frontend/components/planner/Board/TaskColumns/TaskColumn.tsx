import { usePlanner } from '@/hooks/Planner/Planner'
import { usePlannerFilters } from '@/hooks/PlannerFilters/PlannerFilters'
import { Draggable, Droppable } from '@hello-pangea/dnd'
import { AddTaskCardButton } from './AddTaskCardButton'
import { InitializingTaskCard } from './TaskCard/InitializingTaskCard/InitializingTaskCard'
import { TaskCard } from './TaskCard/TaskCard'

type TaskColumnProps = {
  index: number
  boardId: string
  columnId: string
}

export const TaskColumn = ({ index, boardId, columnId }: TaskColumnProps) => {
  const { columns, taskCards, taskCardBeingInitialized } = usePlanner()
  const { selectedCategories } = usePlannerFilters()
  const columnInfo = columns[columnId]
  return (
    <Draggable draggableId={columnInfo.id} index={index}>
      {(provided) => (
        <div
          className={`task-column flex flex-col mr-2 gap-2 w-96 h-[400px]`}
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <AddTaskCardButton boardId={boardId} columnId={columnInfo.id} dragHandleProps={provided.dragHandleProps} />
          <Droppable droppableId={columnInfo.id} type='card'>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex flex-col transition ease grow p-1 px-2 rounded-lg ${
                  snapshot.isDraggingOver ? 'bg-neutral-400' : 'bg-neutral-300'
                }`}
              >
                {taskCardBeingInitialized && taskCardBeingInitialized.columnId === columnId && (
                  <InitializingTaskCard columnId={columnInfo.id} />
                )}
                {columnInfo.taskCards.map((taskCardId, index) => {
                  const doesTaskCardBelongToSelectedCategories =
                    selectedCategories.length === 0 || selectedCategories.includes(taskCards[taskCardId].category)
                  if (doesTaskCardBelongToSelectedCategories)
                    return (
                      <TaskCard
                        key={taskCardId}
                        index={index}
                        boardId={boardId}
                        columnId={columnId}
                        taskCardId={taskCardId}
                      />
                    )
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  )
}
