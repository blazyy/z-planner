import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { Settings } from 'lucide-react'
import { getCategoryBadgeClassNames } from './utils'

type CategoryBadgeProps = {
  taskCardId: string
}

export const CategoryBadge = ({ taskCardId }: CategoryBadgeProps) => {
  const plannerDispatch = usePlannerDispatch()!
  const { taskCards, categories } = usePlanner()!
  const selectedCategoryName = taskCards[taskCardId].category
  const allCategoryNames = Object.keys(categories).sort()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Badge className={getCategoryBadgeClassNames(categories[selectedCategoryName].color)}>
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
              plannerDispatch({
                type: 'taskCategoryChanged',
                payload: {
                  taskCardId,
                  chosenCategory: categoryName,
                },
              })
            }}
          >
            <Badge className={getCategoryBadgeClassNames(categories[categoryName].color)}>{categoryName}</Badge>
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
