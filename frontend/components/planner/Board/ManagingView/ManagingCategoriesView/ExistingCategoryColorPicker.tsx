import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Dispatch, SetStateAction } from 'react'
import { badgeClassNames } from '../../TaskColumns/TaskCard/utils'
import { getCapitalizedColorName } from './CategoryColorPickers'

type ExistingCategoryColorPickerProps = {
  categoryColor: string
  setCategoryColor: Dispatch<SetStateAction<string>>
}

export const ExistingCategoryColorPicker = ({ categoryColor, setCategoryColor }: ExistingCategoryColorPickerProps) => {
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
                onClick={() => setCategoryColor(color)}
              />
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
