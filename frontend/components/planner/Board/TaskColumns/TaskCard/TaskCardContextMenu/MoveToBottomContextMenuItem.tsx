import { ContextMenuItem } from '@/components/ui/context-menu'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { useAuth } from '@clerk/nextjs'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { ArrowBigDown } from 'lucide-react'
import { useContext } from 'react'
import { ContextMenuItemContext } from './TaskCardContextMenu'

export const MoveToBottomContextMenuItem = () => {
  const dispatch = usePlannerDispatch()
  const { getToken } = useAuth()
  const { columns } = usePlanner()
  const { columnId, taskCardId, iconProps, contextMenuItemProps } = useContext(ContextMenuItemContext)!
  const index = columns[columnId].taskCards.indexOf(taskCardId)
  const lastIndex = columns[columnId].taskCards.length - 1

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
    <ContextMenuItem disabled={index === lastIndex}>
      <div
        {...contextMenuItemProps}
        onClick={() => {
          const startingColumn = columns[columnId]
          const reorderedCardIds = Array.from(startingColumn.taskCards) // Copy of taskCards
          reorderedCardIds.splice(index, 1)
          reorderedCardIds.splice(lastIndex, 0, taskCardId)
          return moveCardWithinColumnMutation.mutate({
            columnId,
            reorderedCardIds,
          })
        }}
      >
        <ArrowBigDown {...iconProps} />
        <span>Move to bottom</span>
      </div>
    </ContextMenuItem>
  )
}
