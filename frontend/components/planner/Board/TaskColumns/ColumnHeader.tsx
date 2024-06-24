import changeColumnName from '@/app/utils/plannerUtils/columnUtils/changeColumnName'
import { Card, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useErrorBoundary } from 'react-error-boundary'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AddNewCardButton } from './AddNewCardButton'
import { ColumnsDropdownOptionsMenu } from './TaskCard/ColumnsDropdownOptionsMenu'

type ColumnHeaderProps = {
  boardId: string
  columnId: string
  dragHandleProps: DraggableProvidedDragHandleProps | null
}

export const COLUMN_ACTION_ICON_COLOR = 'text-gray-400'

const formSchema = z.object({
  columnName: z.string().min(2, {
    message: 'Column name must be at least 2 characters.',
  }),
})

export const ColumnHeader = ({ boardId, columnId, dragHandleProps }: ColumnHeaderProps) => {
  const { columns } = usePlanner()
  const [isEditingColumnName, setIsEditingColumnName] = useState(false)
  const dispatch = usePlannerDispatch()
  const { showBoundary } = useErrorBoundary()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      columnName: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    changeColumnName(columnId, values.columnName, dispatch, showBoundary)
    setIsEditingColumnName(false)
  }

  return (
    <Card {...dragHandleProps} className='hover:bg-muted mb-1 transition-all cursor-pointer'>
      <CardHeader className='p-1'>
        <div className='flex flex-row justify-between items-center gap-2 px-2'>
          <AddNewCardButton columnId={columnId} />
          {!isEditingColumnName && <div className='text-gray-700 text-lg'>{columns[columnId].name}</div>}
          {isEditingColumnName && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name='columnName'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder='Column name...' {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          )}
          <ColumnsDropdownOptionsMenu
            boardId={boardId}
            columnId={columnId}
            setIsEditingColumnName={setIsEditingColumnName}
          />
        </div>
      </CardHeader>
    </Card>
  )
}
