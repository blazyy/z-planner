import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { useAuth } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { Dispatch, SetStateAction, useState } from 'react'
import { useForm } from 'react-hook-form'
import { MdAdd } from 'react-icons/md'
import * as z from 'zod'

type AddNewColumnFormProps = {
  boardId: string
  setIsAddingColumn: Dispatch<SetStateAction<boolean>>
}

const AddNewColumnForm = ({ boardId, setIsAddingColumn }: AddNewColumnFormProps) => {
  const dispatch = usePlannerDispatch()!
  const { boards } = usePlanner()
  const { getToken } = useAuth()

  const formSchema = z.object({
    columnName: z.string().min(2, {
      message: 'Column title must be at least 2 characters.',
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      columnName: '',
    },
  })

  const addNewColumnMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken()
      const { newColumnDetails, updatedColumns } = data
      return axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/boards/${boardId}/columns`,
        {
          newColumnDetails,
          updatedColumns,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
    },
    onMutate: async (data) => {
      const { newColumnDetails, updatedColumns } = data
      dispatch({
        type: 'newColumnAdded',
        payload: {
          boardId,
          newColumnDetails,
          updatedColumns,
        },
      })
    },
    onError: (err) => {
      dispatch({
        type: 'backendErrorOccurred',
      })
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newColumnId = crypto.randomUUID()
    const newColumnDetails = {
      id: newColumnId,
      name: values.columnName,
      taskCards: [],
    }
    const updatedColumns = Array.from(boards[boardId].columns)
    updatedColumns.push(newColumnId)
    addNewColumnMutation.mutate({
      newColumnDetails,
      updatedColumns,
    })
    setIsAddingColumn(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name='columnName'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input className='h-10' placeholder='Column title' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

type AddNewColumnButtonProps = {
  boardId: string
}

export const AddNewColumnButton = ({ boardId }: AddNewColumnButtonProps) => {
  const [isAddingColumn, setIsAddingColumn] = useState(false)

  return (
    <div className='flex flex-col gap-2'>
      {!isAddingColumn && (
        <div className='flex justify-center items-center gap-2 cursor-pointer'>
          <Button variant='secondary' onClick={() => setIsAddingColumn(true)}>
            Add New Column
            <MdAdd className='ml-2 w-5 h-5' />
          </Button>
        </div>
      )}
      {isAddingColumn && <AddNewColumnForm boardId={boardId} setIsAddingColumn={setIsAddingColumn} />}
    </div>
  )
}
