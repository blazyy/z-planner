import { addNewBoardToPlanner } from '@/app/utils/plannerUtils/boardUtils/addNewBoardToPlanner'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { usePlannerDispatch } from '@/hooks/Planner/Planner'
import { useAuth } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const formSchema = z.object({
  boardName: z.string().min(2, {
    message: 'Board name must be at least 2 characters.',
  }),
})

type AddNewBoardFormProps = {
  isCallout?: boolean
  closeDialog: () => void
}

export const AddNewBoardForm = ({ isCallout = false, closeDialog }: AddNewBoardFormProps) => {
  const dispatch = usePlannerDispatch()!
  const { getToken } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      boardName: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const boardId = crypto.randomUUID()
    const boardName = values.boardName
    addNewBoardToPlanner(boardId, boardName, dispatch, getToken)
    closeDialog()
  }

  return (
    <div className='flex flex-col justify-between items-start gap-2 w-full'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name='boardName'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder='Board name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <div className='flex justify-end gap-1 w-full'>
        {!isCallout && (
          <Button size='sm' variant='secondary' onClick={closeDialog}>
            Cancel
          </Button>
        )}
        <Button size='sm' onClick={() => onSubmit(form.getValues())} disabled={!form.formState.isValid}>
          {isCallout ? 'Create' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
