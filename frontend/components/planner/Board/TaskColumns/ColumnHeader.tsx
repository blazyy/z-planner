import { Card, CardHeader } from '@/components/ui/card'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd'
import { FaPlus } from 'react-icons/fa6'
import { ColumnsDropdownOptionsMenu } from './TaskCard/ColumnsDropdownOptionsMenu'

type ColumnHeaderProps = {
  boardId: string
  columnId: string
  dragHandleProps: DraggableProvidedDragHandleProps | null
}

export const COLUMN_ACTION_ICON_COLOR = 'text-gray-400'

const AddNewCardButton = ({ columnId }: { columnId: string }) => {
  const { taskCardBeingInitialized, dataEnteredInTaskCardBeingInitialized } = usePlanner()
  const dispatch = usePlannerDispatch()!
  return (
    <FaPlus
      className={`${COLUMN_ACTION_ICON_COLOR}`}
      onClick={() => {
        // Only allow an initializing task card to be added in an existing task card doesn't already exist,
        // or if it exists and does not have any info entered and the add button is clicked from another
        // column
        if (
          !taskCardBeingInitialized ||
          (taskCardBeingInitialized &&
            !dataEnteredInTaskCardBeingInitialized &&
            taskCardBeingInitialized.columnId !== columnId)
        ) {
          const newTaskCardId = crypto.randomUUID()
          dispatch({
            type: 'newTaskCardInitialized',
            payload: {
              taskCardId: newTaskCardId,
              columnId,
              isHighlighted: false,
            },
          })
        } else {
          dispatch({
            type: 'taskCardBeingInitializedHighlightStatusChange',
            payload: true,
          })
        }
      }}
    />
  )
}

export const ColumnHeader = ({ boardId, columnId, dragHandleProps }: ColumnHeaderProps) => {
  const { columns } = usePlanner()
  return (
    <Card {...dragHandleProps} className='mb-1 cursor-pointer transition-all hover:bg-muted '>
      <CardHeader className='p-1'>
        <div className='flex flex-row items-center justify-between gap-2 px-2'>
          <AddNewCardButton columnId={columnId} />
          <div className='text-gray-700 text-lg'>{columns[columnId].name}</div>
          <ColumnsDropdownOptionsMenu boardId={boardId} columnId={columnId} />
        </div>
      </CardHeader>
    </Card>
  )
}
