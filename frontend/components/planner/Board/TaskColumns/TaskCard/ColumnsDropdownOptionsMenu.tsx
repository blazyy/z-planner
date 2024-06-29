import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { useAuth } from '@clerk/nextjs'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { Dispatch, SetStateAction } from 'react'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import { SlOptionsVertical } from 'react-icons/sl'
import { COLUMN_ACTION_ICON_COLOR } from '../ColumnHeader'

type ColumnsDropdownOptionsMenuProps = {
  boardId: string
  columnId: string
  setIsEditingColumnName: Dispatch<SetStateAction<boolean>>
}

export const ColumnsDropdownOptionsMenu = ({
  boardId,
  columnId,
  setIsEditingColumnName,
}: ColumnsDropdownOptionsMenuProps) => {
  const { columns } = usePlanner()
  const dispatch = usePlannerDispatch()
  const { getToken } = useAuth()

  const columnsHasTaskCards = columns[columnId].taskCards.length > 0

  const deleteColumnMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken()
      return axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/boards/${boardId}/columns/${columnId}/delete`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
    },
    onMutate: async () => {
      dispatch({
        type: 'columnDeleted',
        payload: {
          boardId,
          columnId,
        },
      })
    },
    onError: (err) => {
      dispatch({
        type: 'backendErrorOccurred',
      })
    },
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <SlOptionsVertical className={`${COLUMN_ACTION_ICON_COLOR}`} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          disabled={columnsHasTaskCards}
          onClick={() => {
            if (!columnsHasTaskCards) {
              deleteColumnMutation.mutate()
            }
          }}
        >
          <div className='flex items-center gap-2'>
            <FiTrash2 className='w-4 h-4' />
            <span>Delete Column</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setIsEditingColumnName(true)}>
          <div className='flex items-center gap-2'>
            <FiEdit2 className='w-4 h-4' />
            <span>Rename Column</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
