import { categoryInfoChanged } from '@/app/utils/plannerUtils/categoryInfoChanged'
import { Button } from '@/components/ui/button'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dispatch, SetStateAction, useState } from 'react'
import { useErrorBoundary } from 'react-error-boundary'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ExistingCategoryColorPicker } from './ExistingCategoryColorPicker'

type ModifyCategoryDialogContentProps = {
  category: string
  closeDialog: () => void
  setCategoryBeingModified: Dispatch<SetStateAction<string>>
}

const formSchema = z.object({
  categoryName: z.string().min(2, {
    message: 'Category name must be at least 2 characters.',
  }),
})

export const ModifyCategoryDialogContent = ({
  category,
  closeDialog,
  setCategoryBeingModified,
}: ModifyCategoryDialogContentProps) => {
  const { categories } = usePlanner()
  const dispatch = usePlannerDispatch()
  const { showBoundary } = useErrorBoundary()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      categoryName: category,
    },
  })

  const [categoryColor, setCategoryColor] = useState(categories[category].color)

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // addNewColumn(boards[boardId], values.columnName, dispatch, showBoundary)
    // setIsAddingCategory(false)
    setCategoryBeingModified('') // Used to reset the category being modified because once onSubmit is called, the category no longer exists
    categoryInfoChanged(category, values.categoryName, categoryColor, dispatch, showBoundary)
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className='mb-5'>Modify Category</DialogTitle>
        <DialogDescription>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name='categoryName'
                render={({ field }) => (
                  <FormItem>
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
            <ExistingCategoryColorPicker categoryColor={categoryColor} setCategoryColor={setCategoryColor} />
          </div>
          <div className='flex justify-end gap-1'>
            <Button size='sm' variant='secondary' onClick={closeDialog}>
              Cancel
            </Button>
            <Button size='sm' onClick={() => onSubmit(form.getValues())}>
              Save
            </Button>
          </div>
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  )
}
