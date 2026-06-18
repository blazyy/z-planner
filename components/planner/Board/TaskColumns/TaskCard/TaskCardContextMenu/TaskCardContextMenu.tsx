import { createContext } from 'react'

import { ContextMenuContent } from '@/components/ui/context-menu'

import { ContextMenuWrapper } from './ContextMenuWrapper'
import { DeleteCardContextMenuItem } from './DeleteCardContextMenuItem'
import { MoveToBottomContextMenuItem } from './MoveToBottomContextMenuItem'
import { MoveToTopContextMenuItem } from './MoveToTopContextMenuItem'

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
  boardId: string
  columnId: string
  taskCardId: string
  iconProps: IconPropsType
  contextMenuItemProps: ContextMenuItemPropsType
}

export const contextMenuItemProps = {
  className: 'flex gap-2 items-center',
}

export const iconProps = {
  className: 'text-gray-500 dark:text-gray-400',
  size: 18,
}

export const ContextMenuItemContext = createContext<ContentMenuItemContextType | null>(null)

export const TaskCardContextMenu = ({ boardId, columnId, taskCardId }: TaskCardContextMenuProps) => {
  return (
    <ContextMenuWrapper boardId={boardId} columnId={columnId} taskCardId={taskCardId}>
      <ContextMenuItemContext.Provider value={{ boardId, columnId, taskCardId, iconProps, contextMenuItemProps }}>
        <ContextMenuContent className='w-48'>
          {/* The delete functionality is in the ContextMenuWrapper since it connects to a confirmation alert dialog */}
          <DeleteCardContextMenuItem />
          <MoveToBottomContextMenuItem />
          <MoveToTopContextMenuItem />
        </ContextMenuContent>
      </ContextMenuItemContext.Provider>
    </ContextMenuWrapper>
  )
}
