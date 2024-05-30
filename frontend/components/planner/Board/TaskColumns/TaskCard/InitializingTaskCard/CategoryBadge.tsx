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
import { usePlanner } from '@/hooks/Planner/Planner'
import { Plus } from 'lucide-react'
import { Dispatch, SetStateAction } from 'react'
import { badgeClassNames } from '../utils'

export type TaskCategoryType = {
  [name: string]: {
    color: string
  }
}

type CategoryBadgeProps = {
  selectedCategory: string
  setSelectedCategory: Dispatch<SetStateAction<string>>
}

export const CategoryBadge = ({ selectedCategory, setSelectedCategory }: CategoryBadgeProps) => {
  const { categories } = usePlanner()
  const allCategoryNames = Object.keys(categories).sort()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Badge className={badgeClassNames[categories[selectedCategory].color]}>{selectedCategory}</Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        {allCategoryNames.map((categoryName, index) => (
          <DropdownMenuCheckboxItem
            key={index}
            checked={selectedCategory === categoryName}
            onClick={(event) => {
              event.preventDefault()
              setSelectedCategory(categoryName)
            }}
          >
            <Badge className={badgeClassNames[categories[categoryName].color]}>{categoryName}</Badge>
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(event) => {
            event.preventDefault()
          }}
        >
          <Plus className='mr-2 h-4 w-4' />
          <span>New Category</span>
          <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
