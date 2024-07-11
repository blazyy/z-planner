import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { usePlanner } from '@/hooks/Planner/Planner'
import { useEffect, useState } from 'react'
import { AddNewColumnButton } from './AddNewColumnButton'
import { ModifyColumnDialogContent } from './ModifyColumnDialogContent'

export const ManageColumnsCard = () => {
  const { boardOrder, boards, columns } = usePlanner()
  const [selectedBoard, setSelectedBoard] = useState(boardOrder[0])
  const [columnBeingModified, setColumnBeingModified] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [key, setKey] = useState(0)

  useEffect(() => {
    if (columnBeingModified) {
      setIsDialogOpen(true)
    }
  }, [columnBeingModified])

  const closeDialog = () => {
    setIsDialogOpen(false)
    setColumnBeingModified('')
    setKey((prevKey) => prevKey + 1) // Resets unsaved changes in dialog when cancel button is clicked
  }

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          closeDialog()
        }
      }}
    >
      <div className='flex flex-col justify-between gap-5 border-slate-200 p-5 border rounded-md w-1/4'>
        <div className='flex flex-col justify-start gap-5 w-full'>
          <div className='flex flex-col'>
            <span className='font-bold text-lg'>Manage Columns</span>
            <span className='text-muted-foreground text-sm'>
              You won&apos;t usually need more than 3-4 columns, but you are free to add more.
            </span>
          </div>
          <Separator />
          <div className='flex flex-col gap-2 w-full'>
            <Select onValueChange={(value) => setSelectedBoard(value)} defaultValue={selectedBoard}>
              <SelectTrigger>
                <SelectValue placeholder='Select a board' />
              </SelectTrigger>
              <SelectContent>
                {boardOrder.map((boardId: string) => (
                  <SelectItem key={boardId} value={boardId}>
                    {boards[boardId].name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {boards[selectedBoard].columns.length === 0 && (
              <div className='flex justify-center items-center gap-2 w-full'>
                <span className='text-muted-foreground text-sm'>No columns yet</span>
              </div>
            )}
            {boards[selectedBoard].columns.map((columnId: string) => {
              return (
                <div key={columnId} className='flex flex-col gap-2 w-full'>
                  <Button
                    className='pl-2 w-full'
                    variant='secondary'
                    onClick={() => {
                      setColumnBeingModified(columnId)
                    }}
                  >
                    <span>{columns[columnId].name}</span>
                  </Button>
                </div>
              )
            })}
          </div>
          {columnBeingModified && (
            <ModifyColumnDialogContent
              key={key}
              closeDialog={closeDialog}
              boardId={selectedBoard}
              columnId={columnBeingModified}
            />
          )}
        </div>
        <AddNewColumnButton boardId={selectedBoard} />
      </div>
    </Dialog>
  )
}
