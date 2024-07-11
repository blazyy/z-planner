import { usePlanner } from '@/hooks/Planner/Planner'
import { useRouter } from 'next/navigation'

export const Planner = () => {
  const router = useRouter()
  const plannerContext = usePlanner()

  if (plannerContext.boardOrder.length > 0) {
    router.push(`/boards/${plannerContext.boardOrder[0]}`)
  }

  return <></>
  // return <AddBoardCallout />
}
