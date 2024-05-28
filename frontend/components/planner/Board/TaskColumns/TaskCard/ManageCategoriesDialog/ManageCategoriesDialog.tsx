import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { usePlanner } from '@/hooks/Planner/Planner'
import { PickerExample } from './GradientPicker'

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
          {/* <DialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your data from our
            servers.
          </DialogDescription> */}
        </DialogHeader>
        {Object.keys(categories).map((category) => (
          <div className='flex items-center' key={category}>
            <p className='text-sm w-48'>{category}</p>
            <PickerExample />
          </div>
        ))}
      </DialogContent>
    </>
  )
}
