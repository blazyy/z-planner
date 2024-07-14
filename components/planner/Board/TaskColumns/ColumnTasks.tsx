import { usePlanner } from '@/hooks/Planner/Planner'
import { usePlannerFilters } from '@/hooks/PlannerFilters/PlannerFilters'
import { cn } from '@/lib/utils'
import { Droppable } from '@hello-pangea/dnd'
import { InitializingTaskCard } from './TaskCard/InitializingTaskCard/InitializingTaskCard'
import { TaskCard } from './TaskCard/TaskCard'

export const ColumnTasks = ({ boardId, columnId }: { boardId: string; columnId: string }) => {
  const { boards, columns, taskCards, taskCardBeingInitialized } = usePlanner()
  const { searchQuery, selectedCategories } = usePlannerFilters()
  const categoriesInBoard = boards[boardId].categories
  const columnInfo = columns[columnId]
  return (
    <Droppable droppableId={columnInfo.id} type='card'>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={cn(
            'flex flex-col transition ease grow p-1 px-2 rounded-lg',
            snapshot.isDraggingOver ? 'bg-neutral-200' : 'bg-neutral-100'
          )}
        >
          {taskCardBeingInitialized && taskCardBeingInitialized.columnId === columnId && (
            <InitializingTaskCard boardId={boardId} columnId={columnId} />
          )}

          {columnInfo.taskCards
            .filter((cardId) => categoriesInBoard.includes(taskCards[cardId].category))
            .map((taskCardId, index) => {
              const doesTaskCardContentMatchSearchQuery = taskCards[taskCardId].title
                .toLowerCase()
                .includes(searchQuery.toLowerCase())

              const doesTaskCardBelongToSelectedCategories =
                selectedCategories.length === 0 || selectedCategories.includes(taskCards[taskCardId].category)

              if (doesTaskCardContentMatchSearchQuery && doesTaskCardBelongToSelectedCategories)
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
  )
}
