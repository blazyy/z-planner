import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { UNASSIGNED_CATEGORY_NAME } from '@/constants/constants'
import { usePlanner } from '@/hooks/Planner/Planner'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { badgeClassNames } from '../../Board/TaskColumns/TaskCard/utils'
import { AddNewCategoryButton } from './AddNewCategoryButton'
import { ModifyCategoryDialogContent } from './ModifyCategoryDialogContent'

export const ManageCategoriesDialog = () => {
  const { categories } = usePlanner()
  const [categoryBeingModified, setCategoryBeingModified] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [key, setKey] = useState(0)

  useEffect(() => {
    if (categoryBeingModified) {
      setIsDialogOpen(true)
    }
  }, [categoryBeingModified])

  const closeDialog = () => {
    setIsDialogOpen(false)
    setCategoryBeingModified('')
    setKey((prevKey) => prevKey + 1) // Resets unsaved changes in dialog when cancel button is clicked
  }

  const Categories = () => (
    <div className='flex flex-col gap-2 w-full'>
      {Object.keys(categories)
        .sort()
        .map((id: string, i: number) => {
          const category = categories[id]
          if (category.name !== UNASSIGNED_CATEGORY_NAME)
            return (
              <div key={`${category.name}-${i}`}>
                <DialogTrigger asChild>
                  <Button
                    className='pl-2 w-full'
                    variant='ghost'
                    onClick={() => {
                      setCategoryBeingModified(id)
                    }}
                  >
                    <div className='flex justify-start items-center gap-2 w-full'>
                      <span className={cn('rounded-md h-6 w-6', badgeClassNames[category.color])} />
                      <span>{category.name}</span>
                    </div>
                  </Button>
                </DialogTrigger>
              </div>
            )
        })}
    </div>
  )

  return (
    <Dialog
      modal={false}
      open={isDialogOpen}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          closeDialog()
        }
      }}
    >
      <div className='flex flex-col justify-start gap-5 w-full'>
        <Categories />
        {categoryBeingModified && (
          <ModifyCategoryDialogContent
            key={key}
            categoryId={categoryBeingModified}
            closeDialog={closeDialog}
            setCategoryBeingModified={setCategoryBeingModified}
          />
        )}
        <AddNewCategoryButton />
      </div>
    </Dialog>
  )
}
