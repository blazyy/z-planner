import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { taskCategoryChanged } from '@/app/store/planner/plannerSlice'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Settings } from 'lucide-react'
import { getCategoryBadgeClassNames } from './utils'

export type TaskCategoryType = {
  [name: string]: {
    color: string
  }
}

type CategoryBadgeProps = {
  taskCardId: string
}

export const CategoryBadge = ({ taskCardId }: CategoryBadgeProps) => {
  const dispatch = useAppDispatch()
  const { data } = useAppSelector((state) => state.planner)
  const selectedCategoryName = data.taskCards[taskCardId].category
  const allCategoryNames = Object.keys(data.categories).sort()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Badge className={getCategoryBadgeClassNames(data.categories[selectedCategoryName].color)}>
          {selectedCategoryName}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        {allCategoryNames.map((categoryName, index) => (
          <DropdownMenuCheckboxItem
            key={index}
            checked={selectedCategoryName === categoryName}
            onClick={(event) => {
              event.preventDefault()
              dispatch(taskCategoryChanged({ taskCardId, chosenCategory: categoryName }))
            }}
          >
            <Badge className={getCategoryBadgeClassNames(data.categories[categoryName].color)}>{categoryName}</Badge>
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(event) => {
            event.preventDefault()
          }}
        >
          <Settings className='mr-2 h-4 w-4' />
          <span>Manage Categories</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
