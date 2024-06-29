import { Button } from '@/components/ui/button'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { useAuth } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { DeleteBoardConfirmDialog } from './DeleteBoardConfirmDialog'

type ModifyBoardDialogContentProps = {
  closeDialog: () => void
  boardId: string
}

const formSchema = z.object({
  boardName: z.string().min(2, {
    message: 'Board name must be at least 2 characters.',
  }),
})

export const ModifyBoardDialogContent = ({ closeDialog, boardId }: ModifyBoardDialogContentProps) => {
  const { boards } = usePlanner()
  const dispatch = usePlannerDispatch()
  const { getToken } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      boardName: boards[boardId].name,
    },
  })

  const changeBoardInfoMutation = useMutation({
    mutationFn: async (newBoardData: any) => {
      const token = await getToken()
      const { newName } = newBoardData
      return axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/boards/${boardId}`,
        {
          newName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
    },
    onMutate: async (newBoardData) => {
      dispatch({
        type: 'boardNameChanged',
        payload: newBoardData,
      })
    },
    onError: (err) => {
      dispatch({
        type: 'backendErrorOccurred',
      })
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newBoardData = {
      boardId,
      newName: values.boardName,
    }
    changeBoardInfoMutation.mutate(newBoardData)
    closeDialog()
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
            <DeleteBoardConfirmDialog boardId={boardId} closeDialog={closeDialog} />
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
