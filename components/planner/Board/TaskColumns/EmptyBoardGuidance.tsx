import { Columns } from 'lucide-react'

// Shown inside the columns area when a board has no columns at all. Additive guidance
// only; the actual "Add New Column" affordance lives in the FilterToolbar, so this just
// points the user there. Renders nothing-disturbing alongside the existing layout.
export const EmptyBoardGuidance = () => {
  return (
    <div
      className='flex flex-col flex-1 justify-center items-center gap-3 px-4 text-center text-neutral-400 dark:text-neutral-500 select-none'
      role='note'
    >
      <Columns className='w-10 h-10' aria-hidden='true' />
      <p className='font-medium text-neutral-600 dark:text-neutral-200 text-lg'>This board has no columns yet</p>
      <p className='max-w-sm text-neutral-500 dark:text-neutral-400 text-sm'>
        Add a column with the {'"'}Add New Column{'"'} button in the toolbar above to start organizing your tasks.
      </p>
    </div>
  )
}
