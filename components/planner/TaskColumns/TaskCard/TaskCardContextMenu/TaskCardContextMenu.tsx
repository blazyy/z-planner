import { produce } from 'immer'
import { useContext, createContext } from 'react'

import { AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Trash2 } from 'lucide-react'
import { ContextMenuContent, ContextMenuItem } from '@/components/ui/context-menu'

import { PlannerContext } from '../../TaskColumns'
import { ContextMenuWrapper } from './ContextMenuWrapper'
import { MoveToBottomContextMenuItem } from './MoveToBottomContextMenuItem'
import { MoveToTopContextMenuItem } from './MoveToTopContextMenuItem'

type TaskCardContextMenuProps = {
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

export const ContextMenuItemContext = createContext<ContentMenuItemContextType | null>(null)

export const TaskCardContextMenu = ({ columnId, taskCardId }: TaskCardContextMenuProps) => {
  const iconProps = {
    className: 'text-gray-500',
    size: 18,
  }
  const contextMenuItemProps = {
    className: 'flex gap-2 items-center',
  }

  return (
    <ContextMenuWrapper columnId={columnId} taskCardId={taskCardId}>
      <ContextMenuItemContext.Provider value={{ columnId, taskCardId, iconProps, contextMenuItemProps }}>
        <ContextMenuContent>
          <ContextMenuItem>
            {/* The delete functionality is in the ContextMenuWrapper since it connects to a confirmation alert dialog */}
            <AlertDialogTrigger>
              <div {...contextMenuItemProps}>
                <Trash2 {...iconProps} />
                <span>Delete task</span>
              </div>
            </AlertDialogTrigger>
          </ContextMenuItem>
          <MoveToBottomContextMenuItem />
          <MoveToTopContextMenuItem />
        </ContextMenuContent>
      </ContextMenuItemContext.Provider>
    </ContextMenuWrapper>
  )
}
