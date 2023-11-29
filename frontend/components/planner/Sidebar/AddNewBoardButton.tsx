import { addNewBoardToPlanner } from '@/app/utils/plannerUtils/boardUtils/addNewBoardToPlanner'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dispatch, SetStateAction } from 'react'
import { useErrorBoundary } from 'react-error-boundary'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const formSchema = z.object({
  boardName: z.string().min(2, {
    message: 'Board name must be at least 2 characters.',
  }),
})

type AddNewBoardButtonProps = {
  setAddingNewBoard: Dispatch<SetStateAction<boolean>>
}

export const AddNewBoardButton = ({ setAddingNewBoard }: AddNewBoardButtonProps) => {
  const dispatch = usePlannerDispatch()
  const { showBoundary } = useErrorBoundary()
  const { boardOrder } = usePlanner()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      boardName: '',
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newBoardDetails = {
      id: crypto.randomUUID(),
      name: values.boardName,
      columns: [],
    }
    addNewBoardToPlanner(boardOrder, newBoardDetails, dispatch, showBoundary)
    setAddingNewBoard(false)
  }

  return (
    <div className='w-full'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='flex gap-1 w-full items-start'>
            <FormField
              control={form.control}
              name='boardName'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input className='w-64' placeholder='Board name...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' className='' onClick={() => {}}>
              Add
            </Button>
            <Button variant='destructive' onClick={() => setAddingNewBoard(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
