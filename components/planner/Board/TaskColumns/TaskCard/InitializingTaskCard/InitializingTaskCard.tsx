import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardFooter, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { UNASSIGNED_CATEGORY_ID } from '@/constants/constants'
import {
  usePlannerDispatch,
  usePlannerEphemeral,
  usePlannerEphemeralDispatch,
  usePlannerSelector,
} from '@/hooks/Planner/Planner'
import { cn } from '@/lib/utils'
import { addNewCardToColumn } from '@/utils/plannerUtils/cardUtils/addNewCardToColumn'

import { CancelButton } from './CancelButton'
import { CategoryBadge } from './CategoryBadge'

type InitializingTaskCardProps = {
  boardId: string
  columnId: string
}

const formSchema = z.object({
  taskCardTitle: z.string().min(2, {
    message: 'Card title must be at least 2 characters.',
  }),
  taskCardDesc: z.string(),
})

export const InitializingTaskCard = ({ boardId, columnId }: InitializingTaskCardProps) => {
  const dispatch = usePlannerDispatch()
  const ephemeralDispatch = usePlannerEphemeralDispatch()
  const column = usePlannerSelector((s) => s.columns[columnId])
  const { taskCardBeingInitialized } = usePlannerEphemeral()
  const [selectedCategory, setSelectedCategory] = useState(UNASSIGNED_CATEGORY_ID)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taskCardTitle: '',
      taskCardDesc: '',
    },
  })

  const [isFormEmpty, setIsFormEmpty] = useState(true)

  // The callback form of watch() registers a subscription, so it belongs in an
  // effect with cleanup — calling it in the render body leaked one subscription
  // per keystroke.
  useEffect(() => {
    const subscription = form.watch((value) => {
      ephemeralDispatch({
        type: 'taskCardBeingInitializedHighlightStatusChange',
        payload: false,
      })
      const dataEntered = value.taskCardTitle !== '' || value.taskCardDesc !== ''
      setIsFormEmpty(!dataEntered)
      ephemeralDispatch({
        type: 'dataEnteredInTaskCardBeingInitializedStatusChanged',
        payload: dataEntered,
      })
    })
    return () => subscription.unsubscribe()
  }, [form, ephemeralDispatch])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newTaskCardDetails = {
      id: taskCardBeingInitialized!.taskCardId,
      title: values.taskCardTitle,
      category: selectedCategory,
      content: values.taskCardDesc,
    }
    addNewCardToColumn(column, newTaskCardDetails, dispatch)
    // newTaskCardAdded used to clear the init scratch state inside the data
    // reducer; that state now lives on the ephemeral side, so clear it here.
    ephemeralDispatch({ type: 'taskCardInitializationCancelled' })
    ephemeralDispatch({ type: 'dataEnteredInTaskCardBeingInitializedStatusChanged', payload: false })
    toast.success('Task added.')
  }

  return (
    <Card className={cn(taskCardBeingInitialized?.isHighlighted ? 'border-2 border-red-500/70' : '', 'my-1')}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <CardHeader className='p-3'>
            <FormField
              control={form.control}
              name='taskCardTitle'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input id='taskCardTitleTextInput' placeholder='Task title' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='taskCardDesc'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea placeholder='Task description... (optional)' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardHeader>
          <CardFooter className='flex justify-between p-3'>
            <div className='flex gap-2'>
              <Button type='submit' size='sm' disabled={!form.formState.isValid}>
                Add
              </Button>
              <CancelButton isFormEmpty={isFormEmpty} />
            </div>
            <CategoryBadge
              boardId={boardId}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
