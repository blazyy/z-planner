import { Button } from '@/components/ui/button'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { changeCategoryInfo } from '@/utils/plannerUtils/categoryUtils/changeCategoryInfo'
import { useAuth } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { Quicksand } from 'next/font/google'
import { Dispatch, SetStateAction, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { CategoryColorPicker } from './CategoryColorPicker'
import { DeleteCategoryConfirmDialog } from './DeleteCategoryConfirmDialog'

const quicksand = Quicksand({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

type ModifyCategoryDialogContentProps = {
  boardId: string
  categoryId: string
  closeDialog: () => void
  setDetailsOfCategoryBeingModified: Dispatch<SetStateAction<{ boardId: string; categoryId: string }>>
}

const formSchema = z.object({
  categoryName: z.string().min(2, {
    message: 'Category name must be at least 2 characters.',
  }),
})

export const ModifyCategoryDialogContent = ({
  boardId,
  categoryId,
  closeDialog,
  setDetailsOfCategoryBeingModified,
}: ModifyCategoryDialogContentProps) => {
  const { getToken } = useAuth()
  const { categories } = usePlanner()
  const dispatch = usePlannerDispatch()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      categoryName: categories[categoryId].name,
    },
  })

  const [categoryColor, setCategoryColor] = useState(categories[categoryId].color)

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setDetailsOfCategoryBeingModified({
      boardId: '',
      categoryId: '',
    }) // Used to reset the category being modified because once onSubmit is called, the category no longer exists
    changeCategoryInfo(categoryId, values.categoryName, categoryColor, dispatch, getToken)
    closeDialog()
  }

  return (
    <DialogContent className={quicksand.className}>
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
            <CategoryColorPicker color={categoryColor} setColor={setCategoryColor} />
          </div>
          <div className='flex justify-between mt-5'>
            <DeleteCategoryConfirmDialog
              boardId={boardId}
              categoryId={categoryId}
              closeDialog={closeDialog}
              setDetailsOfCategoryBeingModified={setDetailsOfCategoryBeingModified}
            />
            <span className='flex gap-1'>
              <Button size='sm' variant='secondary' onClick={closeDialog}>
                Cancel
              </Button>
              <Button size='sm' onClick={() => onSubmit(form.getValues())} disabled={!form.formState.isValid}>
                Save
              </Button>
            </span>
          </div>
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  )
}
