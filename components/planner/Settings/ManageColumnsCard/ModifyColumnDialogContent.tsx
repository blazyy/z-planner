import { Button } from '@/components/ui/button'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import changeColumnName from '@/utils/plannerUtils/columnUtils/changeColumnName'
import deleteColumn from '@/utils/plannerUtils/columnUtils/deleteColumn'
import { useAuth } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { Quicksand } from 'next/font/google'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { ManageItemAlertDialog } from '../ManageItemAlertDialog'

const quicksand = Quicksand({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

type ModifyBoardDialogContentProps = {
  onCloseDialog: () => void
  boardId: string
  columnId: string
}

const formSchema = z.object({
  columnName: z.string().min(2, {
    message: 'Column name must be at least 2 characters.',
  }),
})

export const ModifyColumnDialogContent = ({ onCloseDialog, boardId, columnId }: ModifyBoardDialogContentProps) => {
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
    onCloseDialog()
    changeColumnName(columnId, values.columnName, dispatch, getToken)
  }

  return (
    <DialogContent className={quicksand.className}>
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
            <ManageItemAlertDialog
              onCloseParentDialog={onCloseDialog}
              isDeleteButtonDisabled={columns[columnId].taskCards.length > 0}
              deleteButtonDisabledTooltipContent='A column with tasks cannot be deleted.'
              onClickDelete={() => {
                deleteColumn(boardId, columnId, dispatch, getToken)
                toast.success('Column deleted.')
              }}
            />
            <span className='flex gap-1'>
              <Button size='sm' variant='secondary' onClick={onCloseDialog}>
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
