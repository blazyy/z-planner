import { changeCategoryColor } from '@/app/utils/plannerUtils/changeCategoryColor'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { cn } from '@/lib/utils'
import { useErrorBoundary } from 'react-error-boundary'
import { badgeClassNames } from '../../TaskColumns/TaskCard/utils'
import { getCapitalizedColorName } from './CategoryColorPickers'

export const ExistingCategoryColorPicker = ({ category }: { category: string }) => {
  const dispatch = usePlannerDispatch()
  const { showBoundary } = useErrorBoundary()
  const { categories } = usePlanner()
  const categoryColor = categories[category].color

  return (
    <Popover modal={true}>
      <PopoverTrigger>
        <Button variant='outline' className='justify-start w-[220px] font-normal text-left'>
          <div className='flex items-center gap-2 w-full'>
            <div
              className={cn('h-4 w-4 rounded !bg-center !bg-cover transition-all', badgeClassNames[categoryColor])}
            ></div>
            <div>{getCapitalizedColorName(categoryColor)}</div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-128'>
        <div className='flex gap-1'>
          {Object.keys(badgeClassNames).map((color) => {
            const className = badgeClassNames[color]
            return (
              <div
                key={color}
                className={cn('rounded-md h-6 w-6 cursor-pointer', className)}
                onClick={() => changeCategoryColor(category, color, dispatch, showBoundary)}
              />
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
