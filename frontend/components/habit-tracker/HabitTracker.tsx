import { ReactElement } from 'react'

const HabitSquare = ({ color }: { color: string }) => {
  const squareWidth = 8
  const dimensionClassNames = `h-${squareWidth} w-${squareWidth}`
  return <div className={`${color} rounded-sm ${dimensionClassNames}`} />
}

const emeraldColors = [
  'bg-emerald-100',
  'bg-emerald-200',
  'bg-emerald-300',
  'bg-emerald-400',
  'bg-emerald-500',
  'bg-emerald-600',
  'bg-emerald-700',
  'bg-emerald-800',
  'bg-emerald-900',
]

const HabitSquaresGrid = (): JSX.Element => {
  const habitSquaresRow = []
  for (let i = 0; i < 9; i++) {
    habitSquaresRow.push(<HabitSquare key={i} color={emeraldColors[i]} />)
  }
  return <div className='flex flex-row gap-2'>{habitSquaresRow}</div>
}

export function HabitTracker() {
  return (
    <main className='flex min-h-screen flex-col items-center gap-8'>
      <h1 className='text-8xl font-semibold'>Habit Tracker</h1>
      <HabitSquaresGrid />
    </main>
  )
}
