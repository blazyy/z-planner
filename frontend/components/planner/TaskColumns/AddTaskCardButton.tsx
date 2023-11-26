import { Card, CardHeader } from '@/components/ui/card'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd'
import { FaPlus } from 'react-icons/fa6'
import { ColumnsDropdownOptionsMenu } from './TaskCard/ColumnsDropdownOptionsMenu'

type AddTaskCardButtonProps = {
  boardId: string
  columnId: string
  dragHandleProps: DraggableProvidedDragHandleProps | null
}

export const AddTaskCardButton = ({ boardId, columnId, dragHandleProps }: AddTaskCardButtonProps) => {
  const { columns, taskCardBeingInitialized, dataEnteredInTaskCardBeingInitialized } = usePlanner()
  const dispatch = usePlannerDispatch()!
  return (
    <Card {...dragHandleProps} className='mb-2 cursor-pointer'>
      <CardHeader className='p-2 h-10'>
        <div className=' flex flex-row items-center justify-between gap-2'>
          <FaPlus
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
          <div className='text-gray-500 text-lg'>{columns[columnId].name}</div>
          <ColumnsDropdownOptionsMenu boardId={boardId} columnId={columnId} />
        </div>
      </CardHeader>
    </Card>
  )
}
