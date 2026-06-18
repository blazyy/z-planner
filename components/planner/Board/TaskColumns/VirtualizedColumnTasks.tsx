import { Draggable, Droppable } from '@hello-pangea/dnd'
import type { DraggableProvidedDraggableProps, DraggableRubric, DraggableStateSnapshot } from '@hello-pangea/dnd'
import { memo } from 'react'
import { FixedSizeList } from 'react-window'
import type { ListChildComponentProps } from 'react-window'

import { cn } from '@/lib/utils'

import { ColumnEmptyState } from './ColumnEmptyState'
import { InitializingTaskCard } from './TaskCard/InitializingTaskCard/InitializingTaskCard'
import { TaskCard } from './TaskCard/TaskCard'
import { VIRTUALIZED_CARD_ROW_HEIGHT, VIRTUALIZED_LIST_HEIGHT } from './virtualizationConfig'

/*
 * perf-6 (flag-ON path ONLY). Default behavior lives in ColumnTasks; this file
 * is dead code unless NEXT_PUBLIC_VIRTUALIZE_COLUMNS === 'true'.
 *
 * Renders the column's visible cards through react-window so only the on-screen
 * window of cards mounts, following the documented @hello-pangea/dnd virtual-list
 * integration:
 *   - Droppable mode="virtual" so the library knows the list is windowed (dragged
 *     items can unmount when scrolled out of view).
 *   - renderClone draws the in-flight dragged card, since the real row may be
 *     unmounted by react-window mid-drag. We reuse the same TaskCard markup for
 *     the clone for visual parity.
 *   - The list's outer element gets provided.innerRef + droppableProps via
 *     react-window's outerRef / outer wrapper.
 *   - The row renderer merges react-window's absolute-position `style` onto the
 *     row element (the standard pattern). We do NOT render provided.placeholder;
 *     instead itemCount is bumped by one while a drop is being previewed
 *     (snapshot.isUsingPlaceholder), which is how the virtual pattern reserves
 *     the gap.
 *
 * KNOWN FLAG-ON LIMITATIONS (acceptable because the flag is OFF by default):
 *   1. Fixed row height. react-window's FixedSizeList needs a constant item
 *      size, but task cards are variable-height (subtasks, progress bar, long
 *      titles). VIRTUALIZED_CARD_ROW_HEIGHT is an estimate; tall cards will clip
 *      or overlap. A VariableSizeList with measured heights would fix this but is
 *      out of scope for the default-off flag.
 *   2. TaskCard owns its own Draggable internally, so for the row we apply
 *      react-window's absolute `style` to an OUTER wrapper that contains the
 *      Draggable, rather than merging it directly onto the Draggable element as
 *      the canonical example does. Positioning is correct at rest; the drag
 *      transform operates inside the absolutely-positioned wrapper, which can look
 *      slightly off at window edges during a drag. renderClone covers the primary
 *      drag visual so this is cosmetic.
 *   3. The 82vh responsive viewport height is approximated by a fixed pixel
 *      height (VIRTUALIZED_LIST_HEIGHT) because react-window needs a number.
 *
 * The flag-OFF (default) path in ColumnTasks has NONE of these caveats.
 */

type VirtualizedColumnTasksProps = {
  boardId: string
  columnId: string
  droppableId: string
  visibleTaskCardIds: string[]
  isFilterActive: boolean
  isInitializingHere: boolean
  isColumnEmpty: boolean
}

type RowData = {
  boardId: string
  columnId: string
  taskCardIds: string[]
  isFilterActive: boolean
}

// Merge react-window's absolute-position style onto the card row wrapper. This
// is the "wrapper" half of the documented style-merge: react-window positions
// this div, TaskCard's own Draggable lives inside it.
const Row = memo(function Row({ data, index, style }: ListChildComponentProps<RowData>) {
  const { boardId, columnId, taskCardIds, isFilterActive } = data
  const taskCardId = taskCardIds[index]
  // While a drop is previewed the library asks for one extra row (the gap);
  // there's no card id for it, so render an empty spacer that still reserves the
  // windowed slot.
  if (!taskCardId) {
    return <div style={style} aria-hidden='true' />
  }
  return (
    <div style={style}>
      <TaskCard
        index={index}
        boardId={boardId}
        columnId={columnId}
        taskCardId={taskCardId}
        isDragDisabled={isFilterActive}
      />
    </div>
  )
})

export const VirtualizedColumnTasks = memo(function VirtualizedColumnTasks({
  boardId,
  columnId,
  droppableId,
  visibleTaskCardIds,
  isFilterActive,
  isInitializingHere,
  isColumnEmpty,
}: VirtualizedColumnTasksProps) {
  const rowData: RowData = { boardId, columnId, taskCardIds: visibleTaskCardIds, isFilterActive }
  return (
    <Droppable
      droppableId={droppableId}
      type='card'
      mode='virtual'
      renderClone={(provided, _snapshot: DraggableStateSnapshot, rubric: DraggableRubric) => {
        const clonedId = visibleTaskCardIds[rubric.source.index]
        return (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            style={provided.draggableProps.style as DraggableProvidedDraggableProps['style']}
          >
            {clonedId && (
              <TaskCard
                index={rubric.source.index}
                boardId={boardId}
                columnId={columnId}
                taskCardId={clonedId}
                isDragDisabled={isFilterActive}
              />
            )}
          </div>
        )
      }}
    >
      {(provided, snapshot) => {
        // Virtual pattern: don't render provided.placeholder; reserve the drop
        // gap by asking react-window for one extra row while previewing a drop.
        const itemCount = snapshot.isUsingPlaceholder ? visibleTaskCardIds.length + 1 : visibleTaskCardIds.length
        return (
          <div
            className={cn(
              'flex flex-col transition ease grow p-1 px-2 rounded-lg',
              snapshot.isDraggingOver ? 'bg-neutral-200 dark:bg-neutral-700' : 'bg-neutral-100 dark:bg-neutral-800'
            )}
            style={{ minHeight: '82vh', maxHeight: '82vh' }}
          >
            {isInitializingHere && <InitializingTaskCard boardId={boardId} columnId={columnId} />}
            <FixedSizeList
              height={VIRTUALIZED_LIST_HEIGHT}
              width='100%'
              itemCount={itemCount}
              itemSize={VIRTUALIZED_CARD_ROW_HEIGHT}
              itemData={rowData}
              outerRef={provided.innerRef}
              // droppableProps carry the data-* attributes the library needs on
              // the scroll container to register it as a drop target.
              {...provided.droppableProps}
            >
              {Row}
            </FixedSizeList>
            {isColumnEmpty && <ColumnEmptyState isFilterActive={isFilterActive} />}
          </div>
        )
      }}
    </Droppable>
  )
})
