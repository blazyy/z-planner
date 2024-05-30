import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { usePlanner } from '@/hooks/Planner/Planner'
import { AddNewCategoryButton } from './AddNewCategoryButton'
import { ExistingCategoryColorPicker } from './CategoryColorPickers'

export const ManageCategoriesDialog = () => {
  const { categories } = usePlanner()
  return (
    <>
      <DialogTrigger asChild>
        <span>Manage Categories</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>You can add a maximum of 10 categories to your planner.</DialogDescription>
        </DialogHeader>
        {Object.keys(categories).map((category) => {
          if (category !== 'Unassigned')
            return (
              <div className='flex items-center justify-between' key={category}>
                <p className='text-sm w-48'>{category}</p>
                <ExistingCategoryColorPicker category={category} />
              </div>
            )
        })}
        <AddNewCategoryButton />
      </DialogContent>
    </>
  )
}
