import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import changeCardCategory from '@/utils/plannerUtils/cardUtils/changeCardCategory'

import { badgeClassNames, badgeClassNamesWithoutHover } from './utils'

type CategoryBadgeProps = {
  boardId: string
  taskCardId: string
}

export const CategoryBadge = ({ boardId, taskCardId }: CategoryBadgeProps) => {
  const dispatch = usePlannerDispatch()!
  const { boards, taskCards, categories } = usePlanner()
  const categoryInfo = categories[taskCards[taskCardId].category]
  const categoriesInBoard = boards[boardId].categories

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={`Change category (currently ${categoryInfo.name})`}>
        <Badge className={badgeClassNames[categoryInfo.color]}>{categoryInfo.name}</Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        {categoriesInBoard.map((categoryId) => (
          <DropdownMenuCheckboxItem
            key={categoryId}
            checked={taskCards[taskCardId].category === categoryId}
            onClick={(event) => {
              event.preventDefault()
              changeCardCategory(taskCardId, categoryId, dispatch)
            }}
          >
            <Badge variant='defaultNoHover' className={badgeClassNamesWithoutHover[categories[categoryId].color]}>
              {categories[categoryId].name}
            </Badge>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
