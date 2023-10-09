import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { taskCardMovedToBottom } from '@/app/store/planner/reducer'
import { ContextMenuItem } from '@/components/ui/context-menu'
import { ArrowBigDown } from 'lucide-react'
import { useContext } from 'react'
import { ContextMenuItemContext } from './TaskCardContextMenu'

export const MoveToBottomContextMenuItem = () => {
  const dispatch = useAppDispatch()
  const { data } = useAppSelector((state) => state.planner)
  const { columnId, taskCardId, iconProps, contextMenuItemProps } = useContext(ContextMenuItemContext)!
  const index = data.columns[columnId].cardIds.indexOf(taskCardId)
  if (index === data.columns[columnId].cardIds.length - 1) return <></> // Don't show option if card is already at bottom
  return (
    <ContextMenuItem>
      <div
        {...contextMenuItemProps}
        onClick={() =>
          dispatch(
            taskCardMovedToBottom({
              columnId,
              taskCardIndex: index,
            })
          )
        }
      >
        <ArrowBigDown {...iconProps} />
        <span>Move to bottom</span>
      </div>
    </ContextMenuItem>
  )
}
