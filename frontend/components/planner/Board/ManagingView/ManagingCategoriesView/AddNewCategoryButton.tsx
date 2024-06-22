import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { usePlannerDispatch } from '@/hooks/Planner/Planner'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { Dispatch, SetStateAction, useState } from 'react'
import { useErrorBoundary } from 'react-error-boundary'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { badgeClassNames } from '../../TaskColumns/TaskCard/utils'
import { NewCategoryColorPicker } from './CategoryColorPickers'

type AddNewCategoryFormProps = {
  setIsAddingCategory: Dispatch<SetStateAction<boolean>>
}

const formSchema = z.object({
  categoryName: z.string().min(2, {
    message: 'Category name must be at least 2 characters.',
  }),
})

const AddNewCategoryForm = ({ setIsAddingCategory }: AddNewCategoryFormProps) => {
  const { showBoundary } = useErrorBoundary()
  const dispatch = usePlannerDispatch()!

  const colors = Object.keys(badgeClassNames)
  const randColor = colors[Math.floor(Math.random() * colors.length)]
  const [categoryColor, setCategoryColor] = useState(randColor)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      categoryName: '',
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // addNewColumn(boards[boardId], values.columnName, dispatch, showBoundary)
    setIsAddingCategory(false)
  }
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name='categoryName'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className='mt-2' size='sm' type='submit'>
            Submit
          </Button>
        </form>
      </Form>
      <NewCategoryColorPicker category={form.watch('categoryName')} color={categoryColor} setColor={setCategoryColor} />
    </>
  )
}

export const AddNewCategoryButton = () => {
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  return (
    <div className='flex justify-between items-start'>
      {!isAddingCategory && (
        <Button className='w-48' variant='outline' onClick={() => setIsAddingCategory(true)}>
          <Plus className='mr-2 w-4 h-4' /> Add a new category
        </Button>
      )}
      {isAddingCategory && <AddNewCategoryForm setIsAddingCategory={setIsAddingCategory} />}
    </div>
  )
}
