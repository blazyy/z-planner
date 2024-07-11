import { Card, CardHeader } from '@/components/ui/card'
import { usePlanner } from '@/hooks/Planner/Planner'
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd'
import { AddNewCardButton } from './AddNewCardButton'

type ColumnHeaderProps = {
  columnId: string
  dragHandleProps: DraggableProvidedDragHandleProps | null
}

export const COLUMN_ACTION_ICON_COLOR = 'text-gray-400'

export const ColumnHeader = ({ columnId, dragHandleProps }: ColumnHeaderProps) => {
  const { columns } = usePlanner()

  return (
    <Card {...dragHandleProps} className='hover:bg-muted mb-1 transition-all cursor-pointer'>
      <CardHeader className='p-2'>
        <div className='flex flex-row justify-between items-center gap-2 px-2'>
          <div className='font-bold text-gray-700 text-xl'>{columns[columnId].name}</div>
          <AddNewCardButton columnId={columnId} />
        </div>
      </CardHeader>
    </Card>
  )
}
