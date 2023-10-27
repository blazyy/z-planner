import supabase from '@/app/db/supabase'
import { useAppDispatch } from '@/app/store/hooks'
import { newColumnAdded } from '@/app/store/plannerSlice'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { PlusCircle } from 'lucide-react'
import { useState } from 'react'

export const AddNewColumnButton = () => {
  const dispatch = useAppDispatch()
  const [columnBeingInitialized, setColumnBeingInitialized] = useState<boolean>(false)
  const [newColumnName, setNewColumnName] = useState<string>('')
  const { toast } = useToast()
  return (
    <div className='empty-task-column mt-10'>
      <Card
        className='mb-2 cursor-pointer'
        onClick={() => {
          setColumnBeingInitialized(true)
        }}
      >
        <CardHeader className={columnBeingInitialized ? 'p-1' : 'p-2'}>
          {!columnBeingInitialized ? (
            <div className=' flex flex-row gap-2'>
              <PlusCircle className='text-gray-400' />
              <div className='text-gray-500'>Add new column</div>
            </div>
          ) : (
            <div className='flex'>
              <Input
                autoFocus
                placeholder='Enter new column name...'
                className='h-8 text-gray-500 border-none focus-visible:ring-0 focus-visible:ring-transparent'
                onChange={(e) => {
                  setNewColumnName(e.target.value)
                }}
              />
              <div className='flex flex-row gap-2'>
                <Button
                  size='xs'
                  disabled={newColumnName === ''}
                  onClick={async (e) => {
                    e.stopPropagation()
                    setColumnBeingInitialized(false)
                    // dispatch(newColumnAdded({ columnName: newColumnName }))
                    // await supabase
                    //   .from('columns')
                    //   .insert({name: 'Denmark' })
                    //   .then((response) => {
                    //     console.log(response)
                    //   })
                    toast({
                      description: `New column ${newColumnName} created.`,
                    })
                  }}
                >
                  Add
                </Button>
                <Button
                  size='xs'
                  variant='destructive'
                  onClick={(e) => {
                    e.stopPropagation()
                    setColumnBeingInitialized(false)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>
    </div>
  )
}
