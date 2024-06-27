import { addNewCategory } from '@/app/utils/plannerUtils/categoryUtils/addNewCategory'
import { Button } from '@/components/ui/button'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePlannerDispatch } from '@/hooks/Planner/Planner'
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
  const dispatch = usePlannerDispatch()
  const { showBoundary } = useErrorBoundary()

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
      id: crypto.randomUUID(),
      name: values.categoryName,
      color: categoryColor,
    }
    addNewCategory(newCategoryDetails, dispatch, showBoundary)
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
