import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { usePlannerDispatch } from '@/hooks/Planner/Planner'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dispatch, SetStateAction, useState } from 'react'
import { useForm } from 'react-hook-form'
import { MdAdd } from 'react-icons/md'
import * as z from 'zod'

type AddNewColumnFormProps = {
  boardId: string
  setIsAddingColumn: Dispatch<SetStateAction<boolean>>
}

const AddNewColumnForm = ({ boardId, setIsAddingColumn }: AddNewColumnFormProps) => {
  const dispatch = usePlannerDispatch()!

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
    dispatch({
      type: 'newColumnAdded',
      payload: {
        boardId,
        columnId: crypto.randomUUID(),
        columnName: values.columnName,
      },
    })
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
                <Input placeholder='Column title' {...field} />
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
    <div className='task-column flex flex-col mx-2 gap-2'>
      {!isAddingColumn && (
        <div className='flex justify-center items-center gap-2 cursor-pointer'>
          <h1 className='text-xl text-bold text-center' onClick={() => setIsAddingColumn(true)}>
            Add New Column
          </h1>
          <MdAdd fontSize='1.5rem' />
        </div>
      )}
      {isAddingColumn && <AddNewColumnForm boardId={boardId} setIsAddingColumn={setIsAddingColumn} />}
    </div>
  )
}
