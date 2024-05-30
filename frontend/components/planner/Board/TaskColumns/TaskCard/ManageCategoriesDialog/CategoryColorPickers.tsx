import { changeCategoryColor } from '@/app/utils/plannerUtils/changeCategoryColor'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { cn } from '@/lib/utils'
import { Dispatch, SetStateAction } from 'react'
import { useErrorBoundary } from 'react-error-boundary'
import { badgeClassNames } from '../utils'

export const getCapitalizedColorName = (color: string) => color.charAt(0).toUpperCase() + color.slice(1)

export const ExistingCategoryColorPicker = ({ category }: { category: string }) => {
  const dispatch = usePlannerDispatch()
  const { showBoundary } = useErrorBoundary()
  const { categories } = usePlanner()
  const categoryColor = categories[category].color

  return (
    <Popover modal={true}>
      <PopoverTrigger>
        <Button variant='outline' className='w-[220px] justify-start text-left font-normal'>
          <div className='w-full flex items-center gap-2'>
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

type NewCategoryColorPickerProps = {
  category: string
  color: string
  setColor: Dispatch<SetStateAction<string>>
}

export const NewCategoryColorPicker = ({ category, color, setColor }: NewCategoryColorPickerProps) => {
  const dispatch = usePlannerDispatch()
  const { showBoundary } = useErrorBoundary()
  const { categories } = usePlanner()

  return (
    <Popover modal={true}>
      <PopoverTrigger>
        <Button variant='outline' className='w-[220px] justify-start text-left font-normal'>
          <div className='w-full flex items-center gap-2'>
            <div className={cn('h-4 w-4 rounded !bg-center !bg-cover transition-all', badgeClassNames[color])}></div>
            <div>{getCapitalizedColorName(color)}</div>
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
                onClick={() => {
                  setColor(color)
                }}
              />
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
