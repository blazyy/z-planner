import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { usePlanner } from '@/hooks/Planner/Planner'
import { TaskCardInfoType } from '@/hooks/Planner/types'
import { usePlannerFilters, usePlannerFiltersDispatch } from '@/hooks/PlannerFilters/PlannerFilters'
import { FiPlusCircle } from 'react-icons/fi'
import { getCategoryBadgeClassNames } from '../TaskColumns/TaskCard/utils'

const getTaskCardBelongingToCategoryCount = (taskCards: TaskCardInfoType[], category: string) =>
  taskCards.filter((taskCard) => taskCard.category === category).length

export const CategoryFilter = () => {
  const dispatch = usePlannerFiltersDispatch()
  const { selectedCategories } = usePlannerFilters()
  const { categories: allCategories, boards, selectedBoard, columns, taskCards } = usePlanner()

  const allTaskCardsUnderAllColumns = boards[selectedBoard].columns
    .map((colId) => columns[colId].taskCards)
    .flat(1)
    .map((taskCardId) => taskCards[taskCardId])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' className='border-dashed'>
          <div className='flex gap-2 items-center'>
            <FiPlusCircle className='w-4 h-4' />
            <span>Category</span>
            {selectedCategories.length > 0 && (
              <>
                <Separator orientation='vertical' className='mx-2 h-4' />
                {selectedCategories.map((category, i) => (
                  <Badge
                    key={`filterbadge-${i}`}
                    className={getCategoryBadgeClassNames(allCategories[category].color, false)}
                  >
                    {category}
                  </Badge>

                  // <Badge variant='secondary' className='rounded-sm px-1 font-normal' key={`filterbadge-${i}`}>
                  //   {category}
                  // </Badge>
                ))}
              </>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='p-0 w-[200px]' align='start'>
        <Command>
          <CommandInput placeholder='Search categories...' />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {Object.keys(allCategories).map((category, i) => (
                <CommandItem key={`commanditem-${i}`}>
                  <div
                    className='flex gap-2 items-center justify-between w-full'
                    onClick={() =>
                      dispatch({ type: 'selectedCategoriesChanged', payload: { clickedCategory: category } })
                    }
                  >
                    <Checkbox checked={selectedCategories.indexOf(category) !== -1} id='terms' />
                    <span>{category}</span>
                    <span className='ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs'>
                      {getTaskCardBelongingToCategoryCount(allTaskCardsUnderAllColumns, category)}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
