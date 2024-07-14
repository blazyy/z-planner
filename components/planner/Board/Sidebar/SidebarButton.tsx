import { Button } from '@/components/ui/button'
import { usePlannerFiltersDispatch } from '@/hooks/PlannerFilters/PlannerFilters'
import { useRouter } from 'next/navigation'

export const SidebarButton = ({
  isCurrentlySelected,
  label,
  pathname,
  icon,
}: {
  isCurrentlySelected: boolean
  label: string
  pathname: string
  icon?: React.ReactNode
}) => {
  const router = useRouter()
  const filtersDispatch = usePlannerFiltersDispatch()
  return (
    <Button
      variant={isCurrentlySelected ? 'default' : 'ghost'}
      onClick={() => {
        router.push(pathname)
        filtersDispatch({ type: 'filtersReset' })
      }}
    >
      <div className='flex justify-between gap-2 w-full'>
        <div className='flex'>
          {icon ? icon : <></>}
          <span className='ml-5'>{label}</span>
        </div>
      </div>
    </Button>
  )
}
