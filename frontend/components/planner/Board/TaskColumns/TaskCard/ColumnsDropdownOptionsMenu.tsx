import deleteColumn from '@/app/utils/plannerUtils/columnUtils/deleteColumn'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { useErrorBoundary } from 'react-error-boundary'
import { FiTrash2 } from 'react-icons/fi'
import { SlOptionsVertical } from 'react-icons/sl'

type ColumnsDropdownOptionsMenuProps = {
  boardId: string
  columnId: string
}

export const ColumnsDropdownOptionsMenu = ({ boardId, columnId }: ColumnsDropdownOptionsMenuProps) => {
  const { columns } = usePlanner()
  const dispatch = usePlannerDispatch()
  const { showBoundary } = useErrorBoundary()
  const columnsHasTaskCards = columns[columnId].taskCards.length > 0
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <SlOptionsVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          disabled={columnsHasTaskCards}
          onClick={() => {
            if (!columnsHasTaskCards) deleteColumn(boardId, columnId, dispatch, showBoundary)
          }}
        >
          <div className='flex items-center gap-2'>
            <FiTrash2 className='h-4 w-4' />
            <span>Delete Column</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
