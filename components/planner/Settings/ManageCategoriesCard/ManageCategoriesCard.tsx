import { Dispatch, SetStateAction, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { DialogTrigger } from '@/components/ui/dialog'
import { UNASSIGNED_CATEGORY_ID } from '@/constants/constants'
import { usePlanner } from '@/hooks/Planner/Planner'
import { BoardsType, CategoriesType } from '@/hooks/Planner/types'
import { cn } from '@/lib/utils'

import { badgeClassNames } from '../../Board/TaskColumns/TaskCard/utils'
import { ManageItemCardDialogWrapper } from '../ManageItemCardDialogWrapper'
import { SectionTitleAndDescription } from '../SectionTitleAndDescription'
import { AddNewCategoryButton } from './AddNewCategoryButton'
import { ModifyCategoryDialogContent } from './ModifyCategoryDialogContent'

type DetailsOfCategoryBeingModified = {
  boardId: string
  categoryId: string
}

type CategoriesProps = {
  boardOrder: string[]
  boards: BoardsType
  categories: CategoriesType
  setDetailsOfCategoryBeingModified: Dispatch<SetStateAction<DetailsOfCategoryBeingModified>>
}

const Categories = ({ boardOrder, boards, categories, setDetailsOfCategoryBeingModified }: CategoriesProps) => (
  <div className='flex justify-start items-start gap-2 w-full'>
    {boardOrder.map((boardId) => {
      if (boards[boardId].categories.filter((category) => category !== UNASSIGNED_CATEGORY_ID).length === 0) {
        return (
          <div key={boardId} className='flex flex-col gap-2 w-48'>
            <span className='text-lg'>{boards[boardId].name}</span>
            <span className='text-neutral-500 text-sm'>0 categories</span>
          </div>
        )
      }
      return (
        <div key={boardId} className='flex flex-col gap-2'>
          <span className='text-lg'>{boards[boardId].name}</span>
          {boards[boardId].categories.map((categoryId: string) => {
            const category = categories[categoryId]
            if (category.id !== UNASSIGNED_CATEGORY_ID) {
              return (
                <div key={categoryId} className='w-48'>
                  <DialogTrigger asChild>
                    <Badge
                      className={cn('cursor-pointer', badgeClassNames[category.color])}
                      onClick={() => {
                        setDetailsOfCategoryBeingModified({
                          boardId: boardId,
                          categoryId: categoryId,
                        })
                      }}
                    >
                      {category.name}
                    </Badge>
                  </DialogTrigger>
                </div>
              )
            }
          })}
        </div>
      )
    })}
  </div>
)

export const ManageCategoriesCard = () => {
  const { boardOrder, boards, categories } = usePlanner()
  const [detailsOfCategoryBeingModified, setDetailsOfCategoryBeingModified] = useState<DetailsOfCategoryBeingModified>({
    boardId: '',
    categoryId: '',
  })
  const [key, setKey] = useState(0)
  const conditionToOpenDialog = Boolean(
    detailsOfCategoryBeingModified.boardId && detailsOfCategoryBeingModified.categoryId
  )

  const onCloseDialog = () => {
    setDetailsOfCategoryBeingModified({
      boardId: '',
      categoryId: '',
    })
    setKey((prevKey) => prevKey + 1) // Resets unsaved changes in dialog when cancel button is clicked.
  }

  return (
    <ManageItemCardDialogWrapper onCloseDialog={onCloseDialog} conditionToOpenDialog={conditionToOpenDialog}>
      <div className='flex flex-col items-start gap-5'>
        <SectionTitleAndDescription
          title='Categories'
          description='Categories are specific to a board. Think of them as tags.'
        />
        <Categories
          boardOrder={boardOrder}
          boards={boards}
          categories={categories}
          setDetailsOfCategoryBeingModified={setDetailsOfCategoryBeingModified}
        />
        <AddNewCategoryButton />
        {conditionToOpenDialog && (
          <ModifyCategoryDialogContent
            key={key}
            boardId={detailsOfCategoryBeingModified.boardId}
            categoryId={detailsOfCategoryBeingModified.categoryId}
            onCloseDialog={onCloseDialog}
          />
        )}
      </div>
    </ManageItemCardDialogWrapper>
  )
}
