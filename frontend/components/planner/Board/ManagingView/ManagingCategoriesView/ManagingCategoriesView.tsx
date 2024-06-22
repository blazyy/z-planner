import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { badgeClassNames } from '../../TaskColumns/TaskCard/utils'
import { AddNewCategoryButton } from './AddNewCategoryButton'
import { ModifyCategoryDialogContent } from './ModifyCategoryDialogContent'

export const ManagingCategoriesView = () => {
  const { categories } = usePlanner()
  const dispatch = usePlannerDispatch()
  const [categoryBeingModified, setCategoryBeingModified] = useState('')

  const handleCategoryBeingModified = (category: string) => {
    setCategoryBeingModified(category)
  }
  return (
    <Dialog>
      <div className='flex flex-col gap-2 ml-10 w-72'>
        <span className='mb-4 font-bold text-xl'>Manage Categories</span>
        {Object.keys(categories).map((category, i) => {
          if (category !== 'Unassigned')
            return (
              <>
                <DialogTrigger>
                  <Button
                    variant='ghost'
                    className='justify-start w-full'
                    onClick={() => handleCategoryBeingModified(category)}
                  >
                    <div className='flex justify-between items-center gap-2'>
                      <span
                        key={`${categories[category].color}-${i}`}
                        className={cn('rounded-md h-6 w-6 cursor-pointer', badgeClassNames[categories[category].color])}
                      />
                      <span className='flex'>{category}</span>
                    </div>
                  </Button>
                </DialogTrigger>
              </>
            )
        })}
        <ModifyCategoryDialogContent category={categoryBeingModified} />
        <AddNewCategoryButton />
      </div>
    </Dialog>
  )
}
