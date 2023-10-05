import { produce } from 'immer'
import { useContext } from 'react'

import { ArrowBigDown } from 'lucide-react'
import { ContextMenuItem } from '@/components/ui/context-menu'

import { PlannerContext } from '../../TaskColumns'
import { ContextMenuItemContext } from './TaskCardContextMenu'

export const MoveToBottomContextMenuItem = () => {
  const { data, setData } = useContext(PlannerContext)!
  const { columnId, taskCardId, iconProps, contextMenuItemProps } = useContext(ContextMenuItemContext)!
  const index = data.columns[columnId].cardIds.indexOf(taskCardId)
  if (index === data.columns[columnId].cardIds.length - 1) return <></> // Don't show option if card is already at bottom
  return (
    <ContextMenuItem>
      <div
        {...contextMenuItemProps}
        onClick={() => {
          setData(
            produce((draft) => {
              const index = draft.columns[columnId].cardIds.indexOf(taskCardId)
              draft.columns[columnId].cardIds.push(draft.columns[columnId].cardIds.splice(index, 1)[0])
            })
          )
        }}
      >
        <ArrowBigDown {...iconProps} />
        <span>Move to bottom</span>
      </div>
    </ContextMenuItem>
  )
}
