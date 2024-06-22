import { Button } from '@/components/ui/button'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePlanner } from '@/hooks/Planner/Planner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ExistingCategoryColorPicker } from './ExistingCategoryColorPicker'
type ModifyCategoryDialogContentProps = {
  category: string
}

const formSchema = z.object({
  categoryName: z.string().min(2, {
    message: 'Category name must be at least 2 characters.',
  }),
  color: z.string(),
})

export const ModifyCategoryDialogContent = ({ category }: ModifyCategoryDialogContentProps) => {
  const { categories } = usePlanner()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      categoryName: category,
      color: categories[category].color,
    },
  })
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // addNewColumn(boards[boardId], values.columnName, dispatch, showBoundary)
    // setIsAddingCategory(false)
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
              <div className='justify-start items-center gap-1.5 grid mt-5 w-full max-w-sm'>
                <Label htmlFor='categoryColor'>Color</Label>
                <ExistingCategoryColorPicker category={category} />
              </div>
              <div className='flex justify-end gap-1'>
                <Button size='sm'>Save</Button>
                <Button size='sm' variant='destructive'>
                  Delete
                </Button>
              </div>
            </form>
          </Form>
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  )
}
