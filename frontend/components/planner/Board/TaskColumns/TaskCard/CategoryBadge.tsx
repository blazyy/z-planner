import changeCardCategory from '@/app/utils/plannerUtils/cardUtils/changeCardCategory'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { useErrorBoundary } from 'react-error-boundary'
import { badgeClassNames } from './utils'

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
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Badge className={badgeClassNames[categories[selectedCategoryName].color]}>{selectedCategoryName}</Badge>
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
            <Badge className={badgeClassNames[categories[categoryName].color]}>{categoryName}</Badge>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
