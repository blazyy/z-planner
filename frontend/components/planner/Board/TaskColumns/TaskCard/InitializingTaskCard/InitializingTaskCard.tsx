import { Button } from '@/components/ui/button'
import { Card, CardFooter, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { UNASSIGNED_CATEGORY_ID } from '@/constants/constants'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { cn } from '@/lib/utils'
import { useAuth } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
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
  taskCardDesc: z.string().optional(),
})

export const InitializingTaskCard = ({ boardId, columnId }: InitializingTaskCardProps) => {
  const dispatch = usePlannerDispatch()
  const { columns, taskCardBeingInitialized } = usePlanner()
  const [selectedCategory, setSelectedCategory] = useState(UNASSIGNED_CATEGORY_ID)
  const { getToken } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taskCardTitle: '',
      taskCardDesc: '',
    },
  })

  const [isFormEmpty, setIsFormEmpty] = useState(true)

  form.watch((value) => {
    dispatch({
      type: 'taskCardBeingInitializedHighlightStatusChange',
      payload: false,
    })
    const dataEntered = value.taskCardTitle !== '' || value.taskCardDesc !== ''
    setIsFormEmpty(!dataEntered)
    dispatch({
      type: 'dataEnteredInTaskCardBeingInitializedStatusChanged',
      payload: dataEntered,
    })
  })

  const addNewCardMutation = useMutation({
    mutationFn: async (payload: any) => {
      const token = await getToken()
      const { columnId, newTaskCardDetails, updatedTaskCards } = payload
      return axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/columns/${columnId}/cards`,
        {
          newTaskCardDetails,
          updatedTaskCards,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
    },
    onMutate: async (payload) => {
      dispatch({
        type: 'newTaskCardAdded',
        payload: payload,
      })
    },
    onError: (err) => {
      dispatch({
        type: 'backendErrorOccurred',
      })
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newTaskCardDetails = {
      id: taskCardBeingInitialized!.taskCardId,
      title: values.taskCardTitle,
      category: selectedCategory,
      content: values.taskCardDesc,
      checked: false,
      subTasks: [],
    }
    const updatedTaskCards = Array.from(columns[columnId].taskCards)
    updatedTaskCards.unshift(newTaskCardDetails.id) // Add to beginning of array
    const payload = {
      columnId,
      newTaskCardDetails,
      updatedTaskCards,
    }
    addNewCardMutation.mutate(payload)
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
                    <Input placeholder='Task title' {...field} />
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
