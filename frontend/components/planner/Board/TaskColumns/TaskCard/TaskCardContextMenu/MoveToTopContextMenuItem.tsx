import { ContextMenuItem } from '@/components/ui/context-menu'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { useAuth } from '@clerk/nextjs'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { ArrowBigUp } from 'lucide-react'
import { useContext } from 'react'
import { ContextMenuItemContext } from './TaskCardContextMenu'

export const MoveToTopContextMenuItem = () => {
  const dispatch = usePlannerDispatch()
  const { columns } = usePlanner()
  const { getToken } = useAuth()
  const { columnId, taskCardId, iconProps, contextMenuItemProps } = useContext(ContextMenuItemContext)!
  const index = columns[columnId].taskCards.indexOf(taskCardId)

  const moveCardWithinColumnMutation = useMutation({
    mutationFn: async (payload: any) => {
      const token = await getToken()
      const { columnId, reorderedCardIds } = payload
      return axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/columns/${columnId}/cards/move`,
        {
          reorderedCardIds,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
    },
    onMutate: async (payload) => {
      dispatch({
        type: 'cardMovedWithinColumn',
        payload: payload,
      })
    },
    onError: (err) => {
      dispatch({
        type: 'backendErrorOccurred',
      })
    },
  })

  return (
    <ContextMenuItem disabled={index === 0}>
      <div
        {...contextMenuItemProps}
        onClick={() => {
          const startingColumn = columns[columnId]
          const reorderedCardIds = Array.from(startingColumn.taskCards) // Copy of taskCards
          reorderedCardIds.splice(index, 1)
          reorderedCardIds.splice(0, 0, taskCardId)
          return moveCardWithinColumnMutation.mutate({
            columnId,
            reorderedCardIds,
          })
        }}
      >
        <ArrowBigUp {...iconProps} />
        <span>Move to top</span>
      </div>
    </ContextMenuItem>
  )
}
