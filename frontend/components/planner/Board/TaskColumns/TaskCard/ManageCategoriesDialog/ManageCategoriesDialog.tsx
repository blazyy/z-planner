import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { usePlanner } from '@/hooks/Planner/Planner'
import { AddNewCategoryButton } from './AddNewCategoryButton'
import { CategoryColorPicker } from './CategoryColorPicker'

export const ManageCategoriesDialog = () => {
  const { categories } = usePlanner()
  return (
    <>
      <DialogTrigger>
        <span>Manage Categories</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>You can add a maximum of 10 categories to your planner.</DialogDescription>
        </DialogHeader>
        {Object.keys(categories).map((category) => (
          <div className='flex items-center' key={category}>
            <p className='text-sm w-48'>{category}</p>
            <CategoryColorPicker category={category} />
          </div>
        ))}
        <AddNewCategoryButton />
      </DialogContent>
    </>
  )
}
