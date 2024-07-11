import { ContextMenuItem } from '@/components/ui/context-menu'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import moveCardWithinColumn from '@/utils/plannerUtils/cardUtils/moveCardWithinColumn'
import { useAuth } from '@clerk/nextjs'
import { ArrowBigDown } from 'lucide-react'
import { useContext } from 'react'
import { ContextMenuItemContext } from './TaskCardContextMenu'

export const MoveToBottomContextMenuItem = () => {
  const { getToken } = useAuth()
  const dispatch = usePlannerDispatch()
  const { columns } = usePlanner()
  const { columnId, taskCardId, iconProps, contextMenuItemProps } = useContext(ContextMenuItemContext)!
  const index = columns[columnId].taskCards.indexOf(taskCardId)
  const lastIndex = columns[columnId].taskCards.length - 1
  return (
    <ContextMenuItem disabled={index === lastIndex}>
      <div
        {...contextMenuItemProps}
        onClick={() => moveCardWithinColumn(columns, columnId, taskCardId, index, lastIndex, dispatch, getToken)}
      >
        <ArrowBigDown {...iconProps} />
        <span>Move to bottom</span>
      </div>
    </ContextMenuItem>
  )
}
