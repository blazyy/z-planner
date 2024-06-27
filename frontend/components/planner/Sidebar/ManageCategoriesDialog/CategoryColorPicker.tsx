import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Dispatch, SetStateAction } from 'react'
import { badgeClassNames } from '../../Board/TaskColumns/TaskCard/utils'

export const getCapitalizedColorName = (color: string) => color.charAt(0).toUpperCase() + color.slice(1)

type CategoryColorPickerProps = {
  color: string
  setColor: Dispatch<SetStateAction<string>>
}

export const CategoryColorPicker = ({ color, setColor }: CategoryColorPickerProps) => {
  return (
    <Popover modal={true}>
      <PopoverTrigger>
        <Button variant='outline' className='justify-start w-[220px] font-normal text-left'>
          <div className='flex items-center gap-2 w-full'>
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
                onClick={() => setColor(color)}
              />
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
