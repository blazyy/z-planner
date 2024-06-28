import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddNewBoardForm } from './Sidebar/ManageBoardsDialog/AddNewBoardForm'

export const AddBoardCallout = () => {
  return (
    <div className='flex flex-col flex-1 justify-center items-center gap-4 w-full'>
      <Card className='border-2 border-neutral-300 border-solid w-1/4'>
        <CardHeader className='text-center'>
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
