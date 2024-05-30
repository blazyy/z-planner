import { changeCategoryColor } from '@/app/utils/plannerUtils/changeCategoryColor'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { cn } from '@/lib/utils'
import { useErrorBoundary } from 'react-error-boundary'
import { availableColors, BADGE_COLOR_POWER } from '../utils'

export const getTailwindClassName = (color: string, power: number) => `bg-${color}-${power}`

export const getCapitalizedColorName = (color: string) => {
  const colorName = color.split('-')[1]
  return colorName.charAt(0).toUpperCase() + colorName.slice(1)
}

export const CategoryColorPicker = ({ category }: { category: string }) => {
  const dispatch = usePlannerDispatch()
  const { showBoundary } = useErrorBoundary()

  const { categories } = usePlanner()
  const baseColor = categories[category].color
  const tailwindColorClassName = getTailwindClassName(baseColor, BADGE_COLOR_POWER)
  const cannotChangeColor = category === 'Unassigned'

  return (
    <Popover modal={true}>
      <PopoverTrigger disabled={cannotChangeColor}>
        <Button
          variant='outline'
          className='w-[220px] justify-start text-left font-normal'
          disabled={cannotChangeColor}
        >
          <div className='w-full flex items-center gap-2'>
            <div className={cn('h-4 w-4 rounded !bg-center !bg-cover transition-all', tailwindColorClassName)}></div>
            <div className=''>{getCapitalizedColorName(tailwindColorClassName)}</div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-128'>
        <div className='flex gap-1'>
          {availableColors.map((color) => {
            const className = getTailwindClassName(color, BADGE_COLOR_POWER)
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
