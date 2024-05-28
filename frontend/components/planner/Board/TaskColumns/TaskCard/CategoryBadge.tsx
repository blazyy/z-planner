import changeCardCategory from '@/app/utils/plannerUtils/cardUtils/changeCardCategory'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
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
import { useErrorBoundary } from 'react-error-boundary'
import { ManageCategoriesDialog } from './ManageCategoriesDialog/ManageCategoriesDialog'
import { getCategoryBadgeClassNames } from './utils'

type CategoryBadgeProps = {
  taskCardId: string
}

export const CategoryBadge = ({ taskCardId }: CategoryBadgeProps) => {
  const dispatch = usePlannerDispatch()!
  const { taskCards, categories } = usePlanner()
  const { showBoundary } = useErrorBoundary()
  const selectedCategoryName = taskCards[taskCardId].category
  const allCategoryNames = Object.keys(categories).sort()
  return (
    <Dialog>
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
                changeCardCategory(taskCardId, categoryName, dispatch, showBoundary)
              }}
            >
              <Badge className={getCategoryBadgeClassNames(categories[categoryName].color)}>{categoryName}</Badge>
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(event): void => {
              event.preventDefault()
            }}
          >
            <Settings className='mr-2 h-4 w-4' />
            <ManageCategoriesDialog />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Dialog>
  )
}
