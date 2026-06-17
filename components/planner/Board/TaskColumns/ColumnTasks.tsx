import { Droppable } from '@hello-pangea/dnd'
import { memo } from 'react'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { usePlanner, usePlannerEphemeral } from '@/hooks/Planner/Planner'
import { usePlannerFilters } from '@/hooks/PlannerFilters/PlannerFilters'
import { cn } from '@/lib/utils'

import { ColumnEmptyState } from './ColumnEmptyState'
import { InitializingTaskCard } from './TaskCard/InitializingTaskCard/InitializingTaskCard'
import { TaskCard } from './TaskCard/TaskCard'

export const ColumnTasks = memo(function ColumnTasks({ boardId, columnId }: { boardId: string; columnId: string }) {
  const { boards, columns, taskCards } = usePlanner()
  const { taskCardBeingInitialized } = usePlannerEphemeral()
  const { searchQuery, selectedCategories } = usePlannerFilters()
  const categoriesInBoard = boards[boardId].categories
  const columnInfo = columns[columnId]
  // While a filter is active the rendered list diverges from the canonical column order, so a drop
  // index can't be mapped back to the right position in the canonical array. Dragging is disabled
  // instead; filtering then mapping keeps Draggable indices consecutive, which the dnd library requires.
  const isFilterActive = searchQuery !== '' || selectedCategories.length > 0
  const visibleTaskCardIds = columnInfo.taskCards
    .filter((cardId) => categoriesInBoard.includes(taskCards[cardId].category))
    .filter((taskCardId) => {
      const doesTaskCardContentMatchSearchQuery = taskCards[taskCardId].title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())

      const doesTaskCardBelongToSelectedCategories =
        selectedCategories.length === 0 || selectedCategories.includes(taskCards[taskCardId].category)

      return doesTaskCardContentMatchSearchQuery && doesTaskCardBelongToSelectedCategories
    })
  // A card mid-creation in this column counts as content, so the empty-state stays hidden then.
  const isInitializingHere = Boolean(taskCardBeingInitialized && taskCardBeingInitialized.columnId === columnId)
  const isColumnEmpty = visibleTaskCardIds.length === 0 && !isInitializingHere
  return (
    <Droppable droppableId={columnInfo.id} type='card'>
      {(provided, snapshot) => (
        <ScrollArea>
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex flex-col transition ease grow p-1 px-2 rounded-lg',
              snapshot.isDraggingOver ? 'bg-neutral-200' : 'bg-neutral-100'
            )}
            style={{ minHeight: '82vh', maxHeight: '82vh' }}
          >
            {isInitializingHere && <InitializingTaskCard boardId={boardId} columnId={columnId} />}
            {visibleTaskCardIds.map((taskCardId, index) => (
              <TaskCard
                key={taskCardId}
                index={index}
                boardId={boardId}
                columnId={columnId}
                taskCardId={taskCardId}
                isDragDisabled={isFilterActive}
              />
            ))}
            {provided.placeholder}
            {isColumnEmpty && <ColumnEmptyState isFilterActive={isFilterActive} />}
          </div>
          <ScrollBar orientation='vertical' />
        </ScrollArea>
      )}
    </Droppable>
  )
})
