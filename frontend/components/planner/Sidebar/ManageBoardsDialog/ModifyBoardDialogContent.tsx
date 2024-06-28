import { changeBoardInfo } from '@/app/utils/plannerUtils/boardUtils/changeBoardInfo'
import { Button } from '@/components/ui/button'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dispatch, SetStateAction } from 'react'
import { useErrorBoundary } from 'react-error-boundary'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

type ModifyBoardDialogContentProps = {
  closeDialog: () => void
  boardId: string
  setBoardBeingModified: Dispatch<SetStateAction<string>>
}

const formSchema = z.object({
  boardName: z.string().min(2, {
    message: 'Board name must be at least 2 characters.',
  }),
})

export const ModifyBoardDialogContent = ({
  closeDialog,
  boardId,
  setBoardBeingModified,
}: ModifyBoardDialogContentProps) => {
  const { boards } = usePlanner()
  const dispatch = usePlannerDispatch()
  const { showBoundary } = useErrorBoundary()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      boardName: boards[boardId].name,
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setBoardBeingModified('')
    changeBoardInfo(boardId, values.boardName, dispatch, showBoundary)
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className='mb-5'>Modify Board</DialogTitle>
        <DialogDescription>
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
            {/* <DeleteBoardConfirmDialog
              boardId={boardId}
              categoryId={categoryId}
              closeDialog={closeDialog}
              setDetailsOfCategoryBeingModified={setDetailsOfCategoryBeingModified}
            /> */}
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
