import { AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { ContextMenuItem } from '@/components/ui/context-menu'
import { Trash2 } from 'lucide-react'
import { contextMenuItemProps, iconProps } from './TaskCardContextMenu'

export const DeleteCardContextMenuItem = () => {
  return (
    <ContextMenuItem>
      <AlertDialogTrigger>
        <div {...contextMenuItemProps}>
          <Trash2 {...iconProps} />
          <span>Delete task</span>
        </div>
      </AlertDialogTrigger>
    </ContextMenuItem>
  )
}
