import { useAppDispatch } from '@/app/store/hooks'
import { newColumnAdded } from '@/app/store/plannerSlice'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PlusCircle } from 'lucide-react'
import { useState } from 'react'

export const AddNewColumnButton = () => {
  const dispatch = useAppDispatch()
  const [columnBeingInitialized, setColumnBeingInitialized] = useState<boolean>(false)
  const [newColumnName, setNewColumnName] = useState<string>('')
  return (
    <div className='empty-task-column mt-10'>
      <Card
        className='mb-2 cursor-pointer'
        onClick={() => {
          setColumnBeingInitialized(true)
        }}
      >
        <CardHeader className='p-2'>
          {!columnBeingInitialized && (
            <div className=' flex flex-row align-center gap-2'>
              <PlusCircle className='text-gray-400' />
              <div className='text-gray-500'>Add new column</div>
            </div>
          )}
          {columnBeingInitialized && (
            <>
              <Input
                autoFocus
                placeholder='Enter new column name...'
                className='h-1 my-1 text-gray-500 border-none focus-visible:ring-0 focus-visible:ring-transparent'
                onChange={(e) => {
                  setNewColumnName(e.target.value)
                }}
              />
              <div className='flex flex-row gap-2'>
                <Button
                  size='sm'
                  onClick={() => {
                    dispatch(newColumnAdded({ columnName: newColumnName }))
                    setColumnBeingInitialized(false)
                  }}
                >
                  Add
                </Button>
                <Button
                  size='sm'
                  variant='destructive'
                  onClick={() => {
                    console.log('clicked')
                    setColumnBeingInitialized(false)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </CardHeader>
      </Card>
    </div>
  )
}
