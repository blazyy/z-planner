import { Input } from '@/components/ui/input'

export const TaskFilterSearchBar = () => {
  return (
    <Input
      className='w-96 focus-visible:ring-0 focus-visible:ring-transparent'
      type='text'
      placeholder='Search for tasks...'
    />
  )
}
