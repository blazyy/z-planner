'use client'
import { AddNewBoardForm } from '@/components/planner/Settings/ManageBoardsCard/AddNewBoardForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePlanner } from '@/hooks/Planner/Planner'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AddBoardCallout() {
  const { boardOrder } = usePlanner()
  const router = useRouter()

  useEffect(() => {
    if (boardOrder.length > 0) {
      router.push(`/boards/${boardOrder[0]}`)
    }
  }, [boardOrder, router])

  return (
    <div className='flex flex-col flex-1 justify-center items-center gap-4 p-4 w-full'>
      <Card className='border-slate-300 border border-solid w-1/2'>
        <CardHeader>
          <CardTitle>Create New Board</CardTitle>
          <CardDescription>
            Welcome! Get started by adding a new board. We recommend naming a board after an area of your life, i.e.
            Work, Home, etc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddNewBoardForm isCallout={true} closeDialog={() => {}} />
        </CardContent>
      </Card>
    </div>
  )
}
