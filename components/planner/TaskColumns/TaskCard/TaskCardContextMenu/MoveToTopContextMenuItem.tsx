import { produce } from 'immer'
import { useContext } from 'react'

import { ArrowBigUp } from 'lucide-react'
import { ContextMenuItem } from '@/components/ui/context-menu'

import { PlannerContext } from '../../TaskColumns'
import { ContextMenuItemContext } from './TaskCardContextMenu'

export const MoveToTopContextMenuItem = () => {
  const { data, setData } = useContext(PlannerContext)!
  const { columnId, taskCardId, iconProps, contextMenuItemProps } = useContext(ContextMenuItemContext)!
  const index = data.columns[columnId].cardIds.indexOf(taskCardId)
  if (index === 0) return <></> // Don't show option if card is already at top
  return (
    <ContextMenuItem>
      <div
        {...contextMenuItemProps}
        onClick={() => {
          setData(
            produce((draft) => {
              draft.columns[columnId].cardIds.unshift(draft.columns[columnId].cardIds.splice(index, 1)[0])
            })
          )
        }}
      >
        <ArrowBigUp {...iconProps} />
        <span>Move to top</span>
      </div>
    </ContextMenuItem>
  )
}
