import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePlannerDispatch, usePlannerSelector } from '@/hooks/Planner/Planner'
import changeCardCategory from '@/utils/plannerUtils/cardUtils/changeCardCategory'

import { badgeClassNames, badgeClassNamesWithoutHover } from './utils'

type CategoryBadgeProps = {
  boardId: string
  taskCardId: string
}

export const CategoryBadge = ({ boardId, taskCardId }: CategoryBadgeProps) => {
  const dispatch = usePlannerDispatch()!
  // categoryId is a primitive (stable), so this badge re-renders only when this
  // card's category, this board's category list, or the categories map changes.
  const categoryId = usePlannerSelector((s) => s.taskCards[taskCardId].category)
  const categoriesInBoard = usePlannerSelector((s) => s.boards[boardId].categories)
  const categories = usePlannerSelector((s) => s.categories)
  const categoryInfo = categories[categoryId]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={`Change category (currently ${categoryInfo.name})`}>
        <Badge className={badgeClassNames[categoryInfo.color]}>{categoryInfo.name}</Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        {categoriesInBoard.map((categoryItemId) => (
          <DropdownMenuCheckboxItem
            key={categoryItemId}
            checked={categoryId === categoryItemId}
            onClick={(event) => {
              event.preventDefault()
              changeCardCategory(taskCardId, categoryItemId, dispatch)
            }}
          >
            <Badge variant='defaultNoHover' className={badgeClassNamesWithoutHover[categories[categoryItemId].color]}>
              {categories[categoryItemId].name}
            </Badge>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
