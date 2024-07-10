import {
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu'
import { usePlanner } from '@/hooks/Planner/Planner'
import { Redo } from 'lucide-react'
import { contextMenuItemProps, iconProps } from './TaskCardContextMenu'

type MoveCardToOtherBoardContextMenuItemProps = {
  boardId: string
}

export const MoveCardToOtherBoardContextMenuItem = ({ boardId }: MoveCardToOtherBoardContextMenuItemProps) => {
  const { boards } = usePlanner()

  return (
    <ContextMenuSub>
      <ContextMenuSubTrigger>
        <div {...contextMenuItemProps}>
          <Redo {...iconProps} />
          <span>Move to board</span>
        </div>
      </ContextMenuSubTrigger>
      <ContextMenuSubContent className='w-48'>
        {Object.keys(boards)
          .filter((id) => id !== boardId)
          .map((boardId) => (
            <ContextMenuItem key={boardId}>
              <div {...contextMenuItemProps}>
                <span>{boards[boardId].name}</span>
              </div>
            </ContextMenuItem>
          ))}
        {/* <ContextMenuItem>
          Save Page As...
          <ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>Create Shortcut...</ContextMenuItem>
        <ContextMenuItem>Name Window...</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Developer Tools</ContextMenuItem> */}
      </ContextMenuSubContent>
    </ContextMenuSub>
  )
}
