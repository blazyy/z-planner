import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { NANOID } from '@/constants/constants'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { addNewCategory } from '@/utils/plannerUtils/categoryUtils/addNewCategory'
import { useAuth } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { Quicksand } from 'next/font/google'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { badgeClassNames } from '../../Board/TaskColumns/TaskCard/utils'
import { CategoryColorPicker } from './CategoryColorPicker'

const quicksand = Quicksand({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

type AddNewCategoryFormProps = {
  closeDialog: () => void
}

const formSchema = z.object({
  categoryName: z.string().min(2, {
    message: 'Category name must be at least 2 characters.',
  }),
})

function getRandomBadgeClassName() {
  const keys = Object.keys(badgeClassNames)
  const randomIndex = Math.floor(Math.random() * keys.length)
  return keys[randomIndex]
}

export const AddNewCategoryForm = ({ closeDialog }: AddNewCategoryFormProps) => {
  const { getToken } = useAuth()
  const { boardOrder, boards } = usePlanner()
  const dispatch = usePlannerDispatch()
  const [selectedBoard, setSelectedBoard] = useState(boardOrder[0])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      categoryName: '',
    },
  })

  const [categoryColor, setCategoryColor] = useState(getRandomBadgeClassName)

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newCategoryDetails = {
      id: NANOID(),
      name: values.categoryName,
      color: categoryColor,
    }
    addNewCategory(selectedBoard, newCategoryDetails, dispatch, getToken)
    toast.success('Category added.')
    closeDialog()
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Select onValueChange={(value) => setSelectedBoard(value)} defaultValue={selectedBoard}>
            <SelectTrigger className='mb-4 w-1/2'>
              <SelectValue placeholder='Select a board' />
            </SelectTrigger>
            <SelectContent className={quicksand.className}>
              {boardOrder.map((boardId) => (
                <SelectItem key={boardId} value={boardId}>
                  {boards[boardId].name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormField
            control={form.control}
            name='categoryName'
            render={({ field }) => (
              <FormItem className='mb-4 w-1/2'>
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
      <div className='justify-start items-center gap-1.5 grid mt-5 w-full max-w-sm'>
        <Label htmlFor='categoryColor'>Color</Label>
        <CategoryColorPicker color={categoryColor} setColor={setCategoryColor} />
      </div>
      <div className='flex justify-end gap-1'>
        <Button size='sm' variant='secondary' onClick={closeDialog}>
          Cancel
        </Button>
        <Button size='sm' onClick={() => onSubmit(form.getValues())} disabled={!form.formState.isValid}>
          Save
        </Button>
      </div>
    </>
  )
}
