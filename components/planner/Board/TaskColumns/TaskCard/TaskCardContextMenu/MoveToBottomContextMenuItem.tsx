import { ArrowBigDown } from 'lucide-react'
import { useContext } from 'react'

import { ContextMenuItem } from '@/components/ui/context-menu'
import { usePlannerDispatch, usePlannerSelector } from '@/hooks/Planner/Planner'
import moveCardWithinColumn from '@/utils/plannerUtils/cardUtils/moveCardWithinColumn'

import { ContextMenuItemContext } from './TaskCardContextMenu'

export const MoveToBottomContextMenuItem = () => {
  const dispatch = usePlannerDispatch()
  const { columnId, taskCardId, iconProps, contextMenuItemProps } = useContext(ContextMenuItemContext)!
  // Subscribe to just this column. moveCardWithinColumn only reads columns[columnId],
  // so reconstructing a single-entry map preserves its behavior without a wide subscription.
  const column = usePlannerSelector((s) => s.columns[columnId])
  const index = column.taskCards.indexOf(taskCardId)
  const lastIndex = column.taskCards.length - 1
  return (
    <ContextMenuItem disabled={index === lastIndex}>
      <div
        {...contextMenuItemProps}
        onClick={() => moveCardWithinColumn({ [columnId]: column }, columnId, taskCardId, index, lastIndex, dispatch)}
      >
        <ArrowBigDown {...iconProps} />
        <span>Move to bottom</span>
      </div>
    </ContextMenuItem>
  )
}
