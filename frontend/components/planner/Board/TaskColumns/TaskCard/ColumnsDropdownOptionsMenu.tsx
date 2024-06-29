import deleteColumn from '@/app/utils/plannerUtils/columnUtils/deleteColumn'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { useAuth } from '@clerk/nextjs'
import { Dispatch, SetStateAction } from 'react'
import { useErrorBoundary } from 'react-error-boundary'
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
  const { getToken } = useAuth()
  const { columns } = usePlanner()
  const dispatch = usePlannerDispatch()
  const { showBoundary } = useErrorBoundary()
  const columnsHasTaskCards = columns[columnId].taskCards.length > 0

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
              deleteColumn(boardId, columnId, dispatch, getToken)
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
