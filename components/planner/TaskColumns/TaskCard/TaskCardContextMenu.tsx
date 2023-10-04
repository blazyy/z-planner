import { produce } from 'immer'
import { useContext } from 'react'
import { useToast } from '@/components/ui/use-toast'

import { Toaster } from '@/components/ui/toaster'
import { ToastAction } from '@/components/ui/toast'
import { ContextMenuContent, ContextMenuItem } from '@/components/ui/context-menu'

import { PlannerContext } from '../TaskColumns'

type TaskCardContextMenuProps = {
  columnId: string
  taskCardId: string
}

export const TaskCardContextMenu = ({ columnId, taskCardId }: TaskCardContextMenuProps) => {
  const { setData } = useContext(PlannerContext)!
  const { toast } = useToast()
  return (
    <>
      <Toaster />
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() => {
            console.log('yo tf')
            setData(
              produce((draft) => {
                draft.columns[columnId].cardIds = draft.columns[columnId].cardIds.filter(
                  (cardId) => cardId !== taskCardId
                )
                delete draft.taskCards[taskCardId]
              })
            )
            toast({
              title: 'Deleted task',
              // description: 'Friday, February 10, 2023 at 5:57 PM',
              action: (
                <ToastAction altText='Undo'>
                  <div className='flex gap-2'>
                    <span>Undo</span>
                    <span className='text-gray-400'> ⌘Z</span>
                  </div>
                </ToastAction>
              ),
            })
          }}
        >
          Delete task
        </ContextMenuItem>
      </ContextMenuContent>
    </>
  )
}
