import { Droppable } from '@hello-pangea/dnd'
import { memo, useMemo } from 'react'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { usePlannerEphemeral, usePlannerSelector } from '@/hooks/Planner/Planner'
import { usePlannerFilters } from '@/hooks/PlannerFilters/PlannerFilters'
import { cn } from '@/lib/utils'

import { ColumnEmptyState } from './ColumnEmptyState'
import { InitializingTaskCard } from './TaskCard/InitializingTaskCard/InitializingTaskCard'
import { TaskCard } from './TaskCard/TaskCard'
import { VIRTUALIZE_COLUMNS } from './virtualizationConfig'
import { VirtualizedColumnTasks } from './VirtualizedColumnTasks'

export const ColumnTasks = memo(function ColumnTasks({ boardId, columnId }: { boardId: string; columnId: string }) {
  // Per-slice subscriptions: this column re-renders when its own column entry
  // (card order) changes or when card title/category used by the filter change,
  // but not when an unrelated column mutates. taskCards is read as a whole map
  // because the filter inspects title/category of each visible card.
  const categoriesInBoard = usePlannerSelector((s) => s.boards[boardId].categories)
  const columnInfo = usePlannerSelector((s) => s.columns[columnId])
  const taskCards = usePlannerSelector((s) => s.taskCards)
  const { taskCardBeingInitialized } = usePlannerEphemeral()
  const { searchQuery, selectedCategories } = usePlannerFilters()
  // While a filter is active the rendered list diverges from the canonical column order, so a drop
  // index can't be mapped back to the right position in the canonical array. Dragging is disabled
  // instead; filtering then mapping keeps Draggable indices consecutive, which the dnd library requires.
  const isFilterActive = searchQuery !== '' || selectedCategories.length > 0
  // Recompute the visible list only when an input it reads actually changes
  // (this column's card order, the board's category set, the cards map, or the
  // active filter), not on every unrelated re-render. Output identity is stable
  // across no-op renders, which also keeps the .map below from rebuilding rows.
  const visibleTaskCardIds = useMemo(
    () =>
      columnInfo.taskCards
        .filter((cardId) => categoriesInBoard.includes(taskCards[cardId].category))
        .filter((taskCardId) => {
          const doesTaskCardContentMatchSearchQuery = taskCards[taskCardId].title
            .toLowerCase()
            .includes(searchQuery.toLowerCase())

          const doesTaskCardBelongToSelectedCategories =
            selectedCategories.length === 0 || selectedCategories.includes(taskCards[taskCardId].category)

          return doesTaskCardContentMatchSearchQuery && doesTaskCardBelongToSelectedCategories
        }),
    [columnInfo.taskCards, categoriesInBoard, taskCards, searchQuery, selectedCategories]
  )
  // A card mid-creation in this column counts as content, so the empty-state stays hidden then.
  const isInitializingHere = Boolean(taskCardBeingInitialized && taskCardBeingInitialized.columnId === columnId)
  const isColumnEmpty = visibleTaskCardIds.length === 0 && !isInitializingHere
  // perf-6: when the (default-off) virtualization flag is on, render the card
  // list through react-window instead. The derived inputs above (visible ids,
  // initializing/empty flags, filter state) are computed identically and handed
  // to the windowed renderer, so only the LIST RENDERING differs. The flag-off
  // branch below is byte-for-byte today's behavior.
  if (VIRTUALIZE_COLUMNS) {
    return (
      <ScrollArea>
        <VirtualizedColumnTasks
          boardId={boardId}
          columnId={columnId}
          droppableId={columnInfo.id}
          visibleTaskCardIds={visibleTaskCardIds}
          isFilterActive={isFilterActive}
          isInitializingHere={isInitializingHere}
          isColumnEmpty={isColumnEmpty}
        />
        <ScrollBar orientation='vertical' />
      </ScrollArea>
    )
  }
  return (
    <Droppable droppableId={columnInfo.id} type='card'>
      {(provided, snapshot) => (
        <ScrollArea>
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex flex-col transition ease grow p-1 px-2 rounded-lg',
              snapshot.isDraggingOver ? 'bg-neutral-200 dark:bg-neutral-700' : 'bg-neutral-100 dark:bg-neutral-800'
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
