import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { taskCardMovedToTop } from '@/app/store/plannerSlice'
import { ContextMenuItem } from '@/components/ui/context-menu'
import { ArrowBigUp } from 'lucide-react'
import { useContext } from 'react'
import { ContextMenuItemContext } from './TaskCardContextMenu'

export const MoveToTopContextMenuItem = () => {
  const dispatch = useAppDispatch()
  const { data } = useAppSelector((state) => state.planner)
  const { columnId, taskCardId, iconProps, contextMenuItemProps } = useContext(ContextMenuItemContext)!
  const index = data.columns[columnId].cardIds.indexOf(taskCardId)
  if (index === 0) return <></> // Don't show option if card is already at top
  return (
    <ContextMenuItem>
      <div
        {...contextMenuItemProps}
        onClick={() =>
          dispatch(
            taskCardMovedToTop({
              columnId,
              taskCardIndex: index,
            })
          )
        }
      >
        <ArrowBigUp {...iconProps} />
        <span>Move to top</span>
      </div>
    </ContextMenuItem>
  )
}
