import { ContextMenuItem } from '@/components/ui/context-menu'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { ArrowBigDown } from 'lucide-react'
import { useContext } from 'react'
import { ContextMenuItemContext } from './TaskCardContextMenu'

export const MoveToBottomContextMenuItem = () => {
  const dispatch = usePlannerDispatch()!
  const { data } = usePlanner()!
  const { columnId, taskCardId, iconProps, contextMenuItemProps } = useContext(ContextMenuItemContext)!
  const index = columns[columnId].cardIds.indexOf(taskCardId)
  if (index === columns[columnId].cardIds.length - 1) return <></> // Don't show option if card is already at bottom
  return (
    <ContextMenuItem>
      <div
        {...contextMenuItemProps}
        onClick={() =>
          dispatch({
            type: 'taskCardMovedToBottom',
            payload: {
              columnId,
              taskCardIndex: index,
            },
          })
        }
      >
        <ArrowBigDown {...iconProps} />
        <span>Move to bottom</span>
      </div>
    </ContextMenuItem>
  )
}
