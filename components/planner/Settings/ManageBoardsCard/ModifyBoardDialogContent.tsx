import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { changeBoardInfo } from '@/utils/plannerUtils/boardUtils/changeBoardInfo'
import deleteBoard from '@/utils/plannerUtils/boardUtils/deleteBoard'

import { ManageItemAlertDialog } from '../ManageItemAlertDialog'

type ModifyBoardDialogContentProps = {
  onCloseDialog: () => void
  boardId: string
}

const formSchema = z.object({
  boardName: z.string().min(2, {
    message: 'Board name must be at least 2 characters.',
  }),
})

export const ModifyBoardDialogContent = ({ onCloseDialog, boardId }: ModifyBoardDialogContentProps) => {
  const { boards } = usePlanner()
  const dispatch = usePlannerDispatch()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      boardName: boards[boardId].name,
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onCloseDialog()
    changeBoardInfo(boardId, values.boardName, dispatch)
    toast.success('Board name changed.')
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className='mb-5'>Modify Board</DialogTitle>
        {/* A div, not DialogDescription: that component renders a <p>, and a form
            inside a paragraph is invalid HTML that browsers re-parent. Classes
            match DialogDescription so the rendering is identical. */}
        <div className='text-sm text-muted-foreground'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name='boardName'
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
              onClickDelete={() => {
                deleteBoard(boardId, dispatch)
                toast.success('Board deleted.')
              }}
              isDeleteButtonDisabled={boards[boardId].columns.length > 0}
              deleteButtonDisabledTooltipContent='A board with columns cannot be deleted.'
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
        </div>
      </DialogHeader>
    </DialogContent>
  )
}
