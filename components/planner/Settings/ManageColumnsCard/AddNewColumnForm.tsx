import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { usePlannerDispatch, usePlannerSelector } from '@/hooks/Planner/Planner'
import { addNewColumn } from '@/utils/plannerUtils/columnUtils/addNewColumn'

const formSchema = z.object({
  columnName: z.string().min(2, {
    message: 'Column name must be at least 2 characters.',
  }),
})

type AddNewColumnFormProps = {
  boardId: string
  closeDialog: () => void
}

export const AddNewColumnForm = ({ boardId, closeDialog }: AddNewColumnFormProps) => {
  const board = usePlannerSelector((s) => s.boards[boardId])
  const dispatch = usePlannerDispatch()!

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      columnName: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const columnName = values.columnName
    addNewColumn(board, columnName, dispatch)
    toast.success('Column added.')
    closeDialog()
  }

  return (
    <div className='flex flex-col justify-between items-start gap-2 w-full'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name='columnName'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder='Column name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <div className='flex justify-end gap-1 w-full'>
        <Button size='sm' variant='secondary' onClick={closeDialog}>
          Cancel
        </Button>
        <Button size='sm' onClick={() => onSubmit(form.getValues())} disabled={!form.formState.isValid}>
          Save
        </Button>
      </div>
    </div>
  )
}
