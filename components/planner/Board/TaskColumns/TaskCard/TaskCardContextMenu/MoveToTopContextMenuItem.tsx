import { ArrowBigUp } from 'lucide-react'
import { useContext } from 'react'

import { ContextMenuItem } from '@/components/ui/context-menu'
import { usePlannerDispatch, usePlannerSelector } from '@/hooks/Planner/Planner'
import moveCardWithinColumn from '@/utils/plannerUtils/cardUtils/moveCardWithinColumn'

import { ContextMenuItemContext } from './TaskCardContextMenu'

export const MoveToTopContextMenuItem = () => {
  const dispatch = usePlannerDispatch()
  const { boardId, columnId, taskCardId, iconProps, contextMenuItemProps } = useContext(ContextMenuItemContext)!
  // Subscribe to just this column. moveCardWithinColumn only reads columns[columnId],
  // so reconstructing a single-entry map preserves its behavior without a wide subscription.
  const column = usePlannerSelector((s) => s.columns[columnId])
  const index = column.taskCards.indexOf(taskCardId)
  return (
    <ContextMenuItem disabled={index === 0}>
      <div
        {...contextMenuItemProps}
        onClick={() => moveCardWithinColumn({ [columnId]: column }, columnId, taskCardId, index, 0, dispatch, boardId)}
      >
        <ArrowBigUp {...iconProps} />
        <span>Move to top</span>
      </div>
    </ContextMenuItem>
  )
}
