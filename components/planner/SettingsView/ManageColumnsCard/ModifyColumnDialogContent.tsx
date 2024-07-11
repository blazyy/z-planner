import changeColumnName from '@/app/utils/plannerUtils/columnUtils/changeColumnName'
import { Button } from '@/components/ui/button'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { useAuth } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { DeleteColumnConfirmDialog } from './DeleteColumnConfirmDialog'

type ModifyBoardDialogContentProps = {
  closeDialog: () => void
  boardId: string
  columnId: string
}

const formSchema = z.object({
  columnName: z.string().min(2, {
    message: 'Column name must be at least 2 characters.',
  }),
})

export const ModifyColumnDialogContent = ({ closeDialog, boardId, columnId }: ModifyBoardDialogContentProps) => {
  const { getToken } = useAuth()
  const { columns } = usePlanner()
  const dispatch = usePlannerDispatch()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      columnName: columns[columnId].name,
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    closeDialog()
    changeColumnName(columnId, values.columnName, dispatch, getToken)
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className='mb-5'>Modify Column</DialogTitle>
        <DialogDescription>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name='columnName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <div className='flex justify-between mt-5'>
            <DeleteColumnConfirmDialog boardId={boardId} columnId={columnId} closeDialog={closeDialog} />
            <span className='flex gap-1'>
              <Button size='sm' variant='secondary' onClick={closeDialog}>
                Cancel
              </Button>
              <Button size='sm' onClick={() => onSubmit(form.getValues())} disabled={!form.formState.isValid}>
                Save
              </Button>
            </span>
          </div>
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  )
}
