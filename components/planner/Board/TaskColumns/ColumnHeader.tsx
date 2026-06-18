import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd'
import { memo } from 'react'

import { Card, CardHeader } from '@/components/ui/card'
import { usePlannerSelector } from '@/hooks/Planner/Planner'
import { cn } from '@/lib/utils'

import { AddNewCardButton } from './AddNewCardButton'

type ColumnHeaderProps = {
  columnId: string
  dragHandleProps: DraggableProvidedDragHandleProps | null
}

// Pure presentational header: reads only its own column name slice. memo so an
// unrelated store mutation (another column/card) doesn't re-render it. Props are
// columnId (stable string) and dragHandleProps (stable per dnd render pass).
export const ColumnHeader = memo(function ColumnHeader({ columnId, dragHandleProps }: ColumnHeaderProps) {
  const columnName = usePlannerSelector((s) => s.columns[columnId].name)

  return (
    <Card
      {...dragHandleProps}
      className={cn('hover:bg-neutral-100 dark:hover:bg-neutral-800 mb-1 transition-all cursor-pointer')}
    >
      <CardHeader className='p-1'>
        <div className='flex flex-row justify-between items-center gap-2 px-2'>
          <div className='font-bold text-gray-700 dark:text-gray-200 text-xl'>{columnName}</div>
          <AddNewCardButton columnId={columnId} />
        </div>
      </CardHeader>
    </Card>
  )
})
