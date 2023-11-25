import moveCardWithinColumn from '@/app/utils/plannerUtils/cardUtils/moveCardWithinColumn'
import { ContextMenuItem } from '@/components/ui/context-menu'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { ArrowBigDown } from 'lucide-react'
import { useContext } from 'react'
import { useErrorBoundary } from 'react-error-boundary'
import { ContextMenuItemContext } from './TaskCardContextMenu'

export const MoveToBottomContextMenuItem = () => {
  const dispatch = usePlannerDispatch()
  const { showBoundary } = useErrorBoundary()
  const { columns } = usePlanner()
  const { columnId, taskCardId, iconProps, contextMenuItemProps } = useContext(ContextMenuItemContext)!
  const index = columns[columnId].taskCards.indexOf(taskCardId)
  const lastIndex = columns[columnId].taskCards.length - 1
  if (index === lastIndex) return <></> // Don't show option if card is already at bottom
  return (
    <ContextMenuItem>
      <div
        {...contextMenuItemProps}
        onClick={() => moveCardWithinColumn(columns, columnId, taskCardId, index, lastIndex, dispatch, showBoundary)}
      >
        <ArrowBigDown {...iconProps} />
        <span>Move to bottom</span>
      </div>
    </ContextMenuItem>
  )
}
