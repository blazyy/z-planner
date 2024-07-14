import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { NANOID } from '@/constants/constants'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { addNewBoardToPlanner } from '@/utils/plannerUtils/boardUtils/addNewBoardToPlanner'
import { useAuth } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

type AddNewBoardFormProps = {
  isCallout?: boolean
  closeDialog: () => void
}

export const AddNewBoardForm = ({ isCallout = false, closeDialog }: AddNewBoardFormProps) => {
  const { getToken } = useAuth()
  const router = useRouter()
  const dispatch = usePlannerDispatch()
  const { boardOrder } = usePlanner()

  const formSchema = z.object({
    boardName: z
      .string()
      .min(2, { message: 'Board name must be at least 2 characters.' })
      .max(25, { message: 'Board name must be at most 25 characters.' })
      .regex(/^[a-zA-Z0-9 _-]*$/, {
        message: 'Board name can only contain letters, numbers, spaces, underscores, and dashes.',
      }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      boardName: '',
    },
    mode: 'onChange',
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const boardId = NANOID()
    addNewBoardToPlanner(boardId, values.boardName, dispatch, getToken)
    toast.success('Board added.')
    closeDialog()
    if (isCallout) {
      router.push(`/boards/${boardId}`)
    }
  }

  return (
    <div className='flex flex-col justify-between items-start gap-2 w-full'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} autoComplete='off'>
          <FormField
            control={form.control}
            name='boardName'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input className='w-72' placeholder='Board name' {...field} />
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
