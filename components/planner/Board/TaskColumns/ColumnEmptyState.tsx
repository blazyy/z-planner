import { Inbox, SearchX } from 'lucide-react'

// Gentle empty-state shown inside a column when it renders zero cards. Additive:
// it only appears when the column is empty, and sits alongside the dnd placeholder
// without affecting drop targets. Copy adapts to whether a filter is hiding cards
// vs the column genuinely having no tasks yet.
export const ColumnEmptyState = ({ isFilterActive }: { isFilterActive: boolean }) => {
  const Icon = isFilterActive ? SearchX : Inbox
  return (
    <div
      className='flex flex-col flex-1 justify-center items-center gap-2 px-4 py-10 text-center text-neutral-400 select-none'
      role='note'
    >
      <Icon className='w-7 h-7' aria-hidden='true' />
      {isFilterActive ? (
        <p className='text-sm'>No tasks match your filters.</p>
      ) : (
        <>
          <p className='font-medium text-neutral-500 text-sm'>No tasks yet</p>
          <p className='text-xs'>Use the + in the column header to add your first task.</p>
        </>
      )}
    </div>
  )
}
