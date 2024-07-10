import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePlanner } from '@/hooks/Planner/Planner'
import { Dispatch, SetStateAction } from 'react'
import { badgeClassNames } from '../utils'

export type TaskCategoryType = {
  [name: string]: {
    color: string
  }
}

type CategoryBadgeProps = {
  boardId: string
  selectedCategory: string
  setSelectedCategory: Dispatch<SetStateAction<string>>
}

export const CategoryBadge = ({ boardId, selectedCategory, setSelectedCategory }: CategoryBadgeProps) => {
  const { boards, categories } = usePlanner()
  const categoriesInBoard = boards[boardId].categories

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Badge className={badgeClassNames[categories[selectedCategory].color]}>
          {categories[selectedCategory].name}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        {categoriesInBoard.map((id: string) => (
          <DropdownMenuCheckboxItem
            key={id}
            checked={selectedCategory === categories[id].name}
            onClick={(event) => {
              event.preventDefault()
              setSelectedCategory(id)
            }}
          >
            <Badge className={badgeClassNames[categories[id].color]}>{categories[id].name}</Badge>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
