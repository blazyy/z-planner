import { addNewColumn } from '@/app/utils/plannerUtils/columnUtils/addNewColumn'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dispatch, SetStateAction, useState } from 'react'
import { useErrorBoundary } from 'react-error-boundary'
import { useForm } from 'react-hook-form'
import { MdAdd } from 'react-icons/md'
import * as z from 'zod'

type AddNewColumnFormProps = {
  boardId: string
  setIsAddingColumn: Dispatch<SetStateAction<boolean>>
}

const AddNewColumnForm = ({ boardId, setIsAddingColumn }: AddNewColumnFormProps) => {
  const { showBoundary } = useErrorBoundary()
  const dispatch = usePlannerDispatch()!
  const { boards } = usePlanner()

  const formSchema = z.object({
    columnName: z.string().min(2, {
      message: 'Column title must be at least 2 characters.',
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      columnName: '',
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addNewColumn(boards[boardId], values.columnName, dispatch, showBoundary)
    setIsAddingColumn(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name='columnName'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input className='h-10' placeholder='Column title' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

type AddNewColumnButtonProps = {
  boardId: string
}

export const AddNewColumnButton = ({ boardId }: AddNewColumnButtonProps) => {
  const [isAddingColumn, setIsAddingColumn] = useState(false)

  return (
    <div className='flex flex-col gap-2'>
      {!isAddingColumn && (
        <div className='flex justify-center items-center gap-2 cursor-pointer'>
          <Button variant='secondary' onClick={() => setIsAddingColumn(true)}>
            Add New Column
            <MdAdd className='ml-2 w-5 h-5' />
          </Button>
        </div>
      )}
      {isAddingColumn && <AddNewColumnForm boardId={boardId} setIsAddingColumn={setIsAddingColumn} />}
    </div>
  )
}
