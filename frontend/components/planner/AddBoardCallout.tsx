import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { usePlannerDispatch } from '@/hooks/Planner/Planner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'

const formSchema = z.object({
  boardName: z.string().min(2, {
    message: 'Board name must be at least 2 characters.',
  }),
  // color: z.string().optional(),
})

export const AddBoardCallout = () => {
  const dispatch = usePlannerDispatch()!

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      boardName: '',
    },
  })

  const [isFormEmpty, setIsFormEmpty] = useState(true)

  form.watch((value) => {
    const dataEntered = value.boardName !== ''
    setIsFormEmpty(!dataEntered)
    setIsFormEmpty(true)
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const boardId = crypto.randomUUID()
    const boardName = values.boardName
    dispatch({
      type: 'newBoardAdded',
      payload: {
        boardId,
        boardName,
      },
    })
  }

  return (
    <Card className='border-solid border-2 border-neutral-300'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader className='text-center'>
            <CardTitle>Create New Board</CardTitle>
            <CardDescription>Welcome! Get started by adding a new board.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid w-full items-center gap-4'>
              <div className='flex flex-col space-y-1.5'>
                {/* <Label htmlFor='board-name-input'>Board Name</Label> */}
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
              </div>
              {/* <div className='flex flex-col space-y-1.5'>
                <Label htmlFor='framework'>Color</Label>
                <Select>
                  <SelectTrigger id='framework'>
                    <SelectValue placeholder='Select' />
                  </SelectTrigger>
                  <SelectContent position='popper'>
                    <SelectItem value='next'>Next.js</SelectItem>
                    <SelectItem value='sveltekit'>SvelteKit</SelectItem>
                    <SelectItem value='astro'>Astro</SelectItem>
                    <SelectItem value='nuxt'>Nuxt.js</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
            </div>
          </CardContent>
          <CardFooter className='flex justify-end'>
            <Button type='submit' size='sm'>
              Create
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
