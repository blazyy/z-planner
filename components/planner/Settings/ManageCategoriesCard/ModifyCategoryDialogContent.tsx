import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UNASSIGNED_CATEGORY_NAME } from '@/constants/constants'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { changeCategoryInfo } from '@/utils/plannerUtils/categoryUtils/changeCategoryInfo'
import deleteCategory from '@/utils/plannerUtils/categoryUtils/deleteCategory'
import { useAuth } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { Quicksand } from 'next/font/google'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { ManageItemAlertDialog } from '../ManageItemAlertDialog'
import { CategoryColorPicker } from './CategoryColorPicker'

const quicksand = Quicksand({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

type ModifyCategoryDialogContentProps = {
  boardId: string
  categoryId: string
  onCloseDialog: () => void
}

const formSchema = z.object({
  categoryName: z.string().min(2, {
    message: 'Category name must be at least 2 characters.',
  }),
})

export const ModifyCategoryDialogContent = ({
  boardId,
  categoryId,
  onCloseDialog,
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
    changeCategoryInfo(categoryId, values.categoryName, categoryColor, dispatch, getToken)
    onCloseDialog()
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
            <ManageItemAlertDialog
              onCloseParentDialog={onCloseDialog}
              onClickDelete={() => {
                deleteCategory(boardId, categoryId, dispatch, getToken)
                toast.success('Category deleted.')
              }}
              isDeleteButtonDisabled={false}
              deleteConfirmationContent={
                <>
                  <span>This action cannot be undone. Any tasks with this category will be moved to</span>
                  {<Badge className='bg-slate-500 hover:bg-slate-700 m-1 text-white'>{UNASSIGNED_CATEGORY_NAME}</Badge>}
                </>
              }
              deleteButtonDisabledTooltipContent=''
            />
            <span className='flex gap-1'>
              <Button size='sm' variant='secondary' onClick={onCloseDialog}>
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
