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

  const categoryInfo = categories[taskCards[taskCardId].category]

  const sortedIds = Object.entries(categories)
    .sort(([, a], [, b]) => a.name.localeCompare(b.name))
    .map(([id]) => id)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Badge className={badgeClassNames[categoryInfo.color]}>{categoryInfo.name}</Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        {sortedIds.map((categoryId, index) => (
          <DropdownMenuCheckboxItem
            key={index}
            checked={categoryInfo.name === categories[categoryId].name}
            onClick={(event) => {
              event.preventDefault()
              changeCardCategory(taskCardId, categoryId, dispatch, showBoundary) // TODO
            }}
          >
            <Badge className={badgeClassNames[categories[categoryId].color]}>{categories[categoryId].name}</Badge>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
