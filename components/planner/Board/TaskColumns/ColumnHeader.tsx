import { Card, CardHeader } from '@/components/ui/card'
import { usePlanner } from '@/hooks/Planner/Planner'
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd'
import { AddNewCardButton } from './AddNewCardButton'

type ColumnHeaderProps = {
  columnId: string
  dragHandleProps: DraggableProvidedDragHandleProps | null
}

export const ColumnHeader = ({ columnId, dragHandleProps }: ColumnHeaderProps) => {
  const { columns } = usePlanner()

  return (
    <Card {...dragHandleProps} className='hover:bg-neutral-100 mb-1 transition-all cursor-pointer'>
      <CardHeader className='p-1'>
        <div className='flex flex-row justify-between items-center gap-2 px-2'>
          <div className='font-bold text-gray-700 text-xl'>{columns[columnId].name}</div>
          <AddNewCardButton columnId={columnId} />
        </div>
      </CardHeader>
    </Card>
  )
}
