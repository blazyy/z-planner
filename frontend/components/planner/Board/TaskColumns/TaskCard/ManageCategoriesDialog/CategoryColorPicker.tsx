import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { usePlanner } from '@/hooks/Planner/Planner'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const availableColors = [
  'slate',
  'stone',
  'red',
  'orange',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
]

export const getTailwindClassName = (color: string, power: number) => `bg-${color}-${power}`

export const getCapitalizedColorName = (color: string) => {
  const colorName = color.split('-')[1]
  return colorName.charAt(0).toUpperCase() + colorName.slice(1)
}

export const CategoryColorPicker = ({ category }: { category: string }) => {
  const { categories } = usePlanner()
  const baseColor = categories[category].color
  const tailwindColorClassName = getTailwindClassName(baseColor, 500)
  const [colorClassName, setColorClass] = useState(tailwindColorClassName)
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
            <div className={cn('h-4 w-4 rounded !bg-center !bg-cover transition-all', colorClassName)}></div>
            <div className=''>{getCapitalizedColorName(colorClassName)}</div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-128'>
        <div className='flex gap-1'>
          {availableColors.map((color) => {
            const className = getTailwindClassName(color, 500)
            return (
              <div
                key={color}
                className={cn('rounded-md h-6 w-6 cursor-pointer', className)}
                onClick={() => setColorClass(className)}
              />
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
