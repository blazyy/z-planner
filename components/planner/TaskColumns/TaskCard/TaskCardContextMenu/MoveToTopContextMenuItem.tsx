import { ContextMenuItem } from '@/components/ui/context-menu'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { ArrowBigUp } from 'lucide-react'
import { useContext } from 'react'
import { ContextMenuItemContext } from './TaskCardContextMenu'

export const MoveToTopContextMenuItem = () => {
  const plannerDispatch = usePlannerDispatch()!
  const { data } = usePlanner()!
  const { columnId, taskCardId, iconProps, contextMenuItemProps } = useContext(ContextMenuItemContext)!
  const index = columns[columnId].cardIds.indexOf(taskCardId)
  if (index === 0) return <></> // Don't show option if card is already at top
  return (
    <ContextMenuItem>
      <div
        {...contextMenuItemProps}
        onClick={() =>
          plannerDispatch({
            type: 'taskCardMovedToTop',
            payload: {
              columnId,
              taskCardIndex: index,
            },
          })
        }
      >
        <ArrowBigUp {...iconProps} />
        <span>Move to top</span>
      </div>
    </ContextMenuItem>
  )
}
