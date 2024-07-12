import { ContextMenuContent } from '@/components/ui/context-menu'
import { cn } from '@/lib/utils'
import { Quicksand } from 'next/font/google'
import { createContext } from 'react'
import { ContextMenuWrapper } from './ContextMenuWrapper'
import { DeleteCardContextMenuItem } from './DeleteCardContextMenuItem'
import { MoveToBottomContextMenuItem } from './MoveToBottomContextMenuItem'
import { MoveToTopContextMenuItem } from './MoveToTopContextMenuItem'

const quicksand = Quicksand({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

type TaskCardContextMenuProps = {
  boardId: string
  columnId: string
  taskCardId: string
}

export type IconPropsType = {
  className: string
  size: number
}

export type ContextMenuItemPropsType = {
  className: string
}

type ContentMenuItemContextType = {
  columnId: string
  taskCardId: string
  iconProps: IconPropsType
  contextMenuItemProps: ContextMenuItemPropsType
}

export const contextMenuItemProps = {
  className: 'flex gap-2 items-center',
}

export const iconProps = {
  className: 'text-gray-500',
  size: 18,
}

export const ContextMenuItemContext = createContext<ContentMenuItemContextType | null>(null)

export const TaskCardContextMenu = ({ boardId, columnId, taskCardId }: TaskCardContextMenuProps) => {
  return (
    <ContextMenuWrapper columnId={columnId} taskCardId={taskCardId}>
      <ContextMenuItemContext.Provider value={{ columnId, taskCardId, iconProps, contextMenuItemProps }}>
        <ContextMenuContent className={cn('w-48', quicksand.className)}>
          {/* The delete functionality is in the ContextMenuWrapper since it connects to a confirmation alert dialog */}
          <DeleteCardContextMenuItem />
          <MoveToBottomContextMenuItem />
          <MoveToTopContextMenuItem />
          {/* <MoveCardToOtherBoardContextMenuItem boardId={boardId} /> */}
        </ContextMenuContent>
      </ContextMenuItemContext.Provider>
    </ContextMenuWrapper>
  )
}
