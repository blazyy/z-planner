import { addNewCategory } from '@/app/utils/plannerUtils/categoryUtils/addNewCategory'
import { Button } from '@/components/ui/button'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useErrorBoundary } from 'react-error-boundary'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { badgeClassNames } from '../../Board/TaskColumns/TaskCard/utils'
import { CategoryColorPicker } from './CategoryColorPicker'

type AddNewCategoryDialogContentProps = {
  closeDialog: () => void
}

const formSchema = z.object({
  boardId: z.string(),
  categoryName: z.string().min(2, {
    message: 'Category name must be at least 2 characters.',
  }),
})

function getRandomBadgeClassName() {
  const keys = Object.keys(badgeClassNames)
  const randomIndex = Math.floor(Math.random() * keys.length)
  return keys[randomIndex]
}

export const AddNewCategoryDialogContent = ({ closeDialog }: AddNewCategoryDialogContentProps) => {
  const { boardOrder, boards } = usePlanner()
  const dispatch = usePlannerDispatch()
  const { showBoundary } = useErrorBoundary()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      boardId: boardOrder[0],
      categoryName: '',
    },
  })

  const [categoryColor, setCategoryColor] = useState(getRandomBadgeClassName)

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newCategoryDetails = {
      id: crypto.randomUUID(),
      name: values.categoryName,
      color: categoryColor,
    }
    addNewCategory(values.boardId, newCategoryDetails, dispatch, showBoundary)
    closeDialog()
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className='mb-5'>Add New Category</DialogTitle>
        <DialogDescription>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name='boardId'
                render={({ field }) => (
                  <FormItem className='mb-4 w-1/2'>
                    <FormLabel>Board</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a board' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {boardOrder.map((boardId) => (
                          <SelectItem key={boardId} value={boardId}>
                            {boards[boardId].name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  )
}
