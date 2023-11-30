import { TaskFilterSearchBar } from '../TaskFilterSearchBar'
import { CategoryFilter } from './CategoryFilter'

export const FilterToolbar = () => {
  return (
    <div className='flex gap-2'>
      <TaskFilterSearchBar />
      <CategoryFilter />
    </div>
  )
}
