import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { UNASSIGNED_CATEGORY_COLOR, UNASSIGNED_CATEGORY_ID, UNASSIGNED_CATEGORY_NAME } from '@/constants/constants'
import { usePlannerDispatch } from '@/hooks/Planner/Planner'
import { useAuth } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
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

  const addNewBoardMutation = useMutation({
    mutationFn: async (newBoardData: any) => {
      const token = await getToken()
      return axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/boards`, newBoardData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    },
    onMutate: async (newBoardData) => {
      dispatch({
        type: 'newBoardAdded',
        payload: newBoardData,
      })
    },
    onError: (err) => {
      dispatch({
        type: 'backendErrorOccurred',
      })
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const newBoardData = {
      boardId: crypto.randomUUID(),
      boardName: values.boardName,
      unassignedCategoryDetails: {
        id: UNASSIGNED_CATEGORY_ID,
        name: UNASSIGNED_CATEGORY_NAME,
        color: UNASSIGNED_CATEGORY_COLOR,
      },
    }
    addNewBoardMutation.mutate(newBoardData)
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
