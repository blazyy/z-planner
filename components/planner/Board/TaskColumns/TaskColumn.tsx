import { usePlanner } from '@/hooks/Planner/Planner'
import { usePlannerFilters } from '@/hooks/PlannerFilters/PlannerFilters'
import { cn } from '@/lib/utils'
import { Draggable, Droppable } from '@hello-pangea/dnd'
import { ColumnHeader } from './ColumnHeader'
import { InitializingTaskCard } from './TaskCard/InitializingTaskCard/InitializingTaskCard'
import { TaskCard } from './TaskCard/TaskCard'

type TaskColumnProps = {
  index: number
  boardId: string
  columnId: string
}

const ColumnTasks = ({ boardId, columnId }: { boardId: string; columnId: string }) => {
  const { boards, columns, taskCards, taskCardBeingInitialized } = usePlanner()
  const { searchQuery, selectedCategories, dateFilter } = usePlannerFilters()
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

              // const doesTaskCardBelongToDateFilter =
              //   (dateFilter && areDatesEqual(new Date(), dateFilter)) ||
              //   (taskCards[taskCardId].dueDate && areDatesEqual(new Date(taskCards[taskCardId].dueDate), dateFilter))

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

export const TaskColumn = ({ index, boardId, columnId }: TaskColumnProps) => {
  const { columns } = usePlanner()
  const columnInfo = columns[columnId]
  return (
    <Draggable draggableId={columnInfo.id} index={index}>
      {(provided) => (
        <div className='flex flex-col gap-2 mr-2 w-96 min-h-full' {...provided.draggableProps} ref={provided.innerRef}>
          <ColumnHeader columnId={columnInfo.id} dragHandleProps={provided.dragHandleProps} />
          <ColumnTasks boardId={boardId} columnId={columnInfo.id} />
        </div>
      )}
    </Draggable>
  )
}
