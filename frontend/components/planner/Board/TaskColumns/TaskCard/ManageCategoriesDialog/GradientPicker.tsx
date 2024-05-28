import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export function PickerExample() {
  const [background, setBackground] = useState('bg-slate-500')

  return <GradientPicker background={background} setBackground={setBackground} />
}

export function GradientPicker({
  background,
  setBackground,
}: {
  background: string
  setBackground: (background: string) => void
}) {
  const colors = [
    'bg-slate-500',
    'bg-stone-500',
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ]

  const getColorName = (color: string) => {
    const colorName = color.split('-')[1]
    return colorName.charAt(0).toUpperCase() + colorName.slice(1)
  }

  return (
    <Popover modal={true}>
      <PopoverTrigger>
        <Button variant='outline' className='w-[220px] justify-start text-left font-normal'>
          <div className='w-full flex items-center gap-2'>
            <div className={cn('h-4 w-4 rounded !bg-center !bg-cover transition-all', background)}></div>
            <div className=''>{getColorName(background)}</div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-128'>
        <div className='flex gap-1'>
          {colors.map((color) => (
            <div
              key={color}
              className={cn('rounded-md h-6 w-6 cursor-pointer', color)}
              onClick={() => setBackground(color)}
            />
          ))}
        </div>
        <Input
          id='custom'
          value={background}
          className='col-span-2 h-8 mt-4'
          onChange={(e) => setBackground(e.currentTarget.value)}
        />
      </PopoverContent>
    </Popover>
  )
}
