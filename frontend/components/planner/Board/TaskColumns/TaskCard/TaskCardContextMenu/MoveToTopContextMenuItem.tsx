import moveCardWithinColumn from '@/app/utils/plannerUtils/cardUtils/moveCardWithinColumn'
import { ContextMenuItem } from '@/components/ui/context-menu'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { ArrowBigUp } from 'lucide-react'
import { useContext } from 'react'
import { useErrorBoundary } from 'react-error-boundary'
import { ContextMenuItemContext } from './TaskCardContextMenu'

export const MoveToTopContextMenuItem = () => {
  const dispatch = usePlannerDispatch()
  const { showBoundary } = useErrorBoundary()
  const { columns } = usePlanner()
  const { columnId, taskCardId, iconProps, contextMenuItemProps } = useContext(ContextMenuItemContext)!
  const index = columns[columnId].taskCards.indexOf(taskCardId)
  return (
    <ContextMenuItem disabled={index === 0}>
      <div
        {...contextMenuItemProps}
        onClick={() => moveCardWithinColumn(columns, columnId, taskCardId, index, 0, dispatch, showBoundary)}
      >
        <ArrowBigUp {...iconProps} />
        <span>Move to top</span>
      </div>
    </ContextMenuItem>
  )
}
