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
import { badgeClassNames } from '../TaskColumns/TaskCard/utils'

const getTaskCardBelongingToCategoryCount = (taskCards: TaskCardInfoType[], category: string) =>
  taskCards.filter((taskCard) => taskCard.category === category).length

export const CategoryFilter = ({ selectedBoard }: { selectedBoard: string }) => {
  const dispatch = usePlannerFiltersDispatch()
  const { selectedCategories } = usePlannerFilters()
  const { categories, boards, columns, taskCards } = usePlanner()
  const categoriesInSelectedBoard = boards[selectedBoard].categories

  const allTaskCardsUnderAllColumns = boards[selectedBoard].columns
    .map((colId) => columns[colId].taskCards)
    .flat(1)
    .map((taskCardId) => taskCards[taskCardId])

  console.log(allTaskCardsUnderAllColumns)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' className='border-dashed'>
          <div className='flex items-center gap-2'>
            <FiPlusCircle className='w-4 h-4' />
            <span>Filter</span>
            {selectedCategories.length > 0 && (
              <>
                <Separator orientation='vertical' className='mx-2 h-4' />
                {selectedCategories.map((category, i) => (
                  <Badge key={`filterbadge-${i}`} className={badgeClassNames[categories[category].color]}>
                    {categories[category].name}
                  </Badge>
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
              {categoriesInSelectedBoard.map((categoryId) => {
                return (
                  <CommandItem key={`commanditem-${categoryId}`}>
                    <div
                      className='flex justify-between items-center gap-2 w-full'
                      onClick={() =>
                        dispatch({ type: 'selectedCategoriesChanged', payload: { clickedCategory: categoryId } })
                      }
                    >
                      <Checkbox checked={selectedCategories.indexOf(categoryId) !== -1} id='terms' />
                      <span>
                        <Badge className={badgeClassNames[categories[categoryId].color]}>
                          {categories[categoryId].name}
                        </Badge>
                      </span>
                      <span className='flex justify-center items-center ml-auto w-4 h-4 font-mono text-xs'>
                        {getTaskCardBelongingToCategoryCount(allTaskCardsUnderAllColumns, categoryId)}
                      </span>
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
