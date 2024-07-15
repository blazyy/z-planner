import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePlanner } from '@/hooks/Planner/Planner'
import { useState } from 'react'
import { ManageItemCardDialogWrapper } from '../ManageItemCardDialogWrapper'
import { SectionTitleAndDescription } from '../SectionTitleAndDescription'
import { AddNewColumnButton } from './AddNewColumnButton'
import { ModifyColumnDialogContent } from './ModifyColumnDialogContent'

export const ManageColumnsCard = () => {
  const { boardOrder, boards, columns } = usePlanner()
  const [selectedBoard, setSelectedBoard] = useState(boardOrder[0])
  const [columnBeingModified, setColumnBeingModified] = useState('')
  const [key, setKey] = useState(0)

  const onCloseDialog = () => {
    setColumnBeingModified('')
    setKey((prevKey) => prevKey + 1) // Resets unsaved changes in dialog when cancel button is clicked
  }

  const BoardSelector = () => {
    return (
      <div className='flex flex-col gap-2 w-96'>
        <Label htmlFor='board-selector'>Board</Label>
        <Select onValueChange={(value) => setSelectedBoard(value)} defaultValue={selectedBoard}>
          <SelectTrigger id='board-selector'>
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
      </div>
    )
  }

  const Columns = () => {
    if (boards[selectedBoard].columns.length === 0) {
      return <span className='text-neutral-500 text-sm'>No columns yet</span>
    }
    return (
      <div className='flex flex-row gap-2'>
        {boards[selectedBoard].columns.map((columnId: string) => {
          return (
            <Button
              key={columnId}
              className='pl-2'
              variant='secondary'
              onClick={() => {
                setColumnBeingModified(columnId)
              }}
            >
              <span>{columns[columnId].name}</span>
            </Button>
          )
        })}
      </div>
    )
  }

  return (
    <ManageItemCardDialogWrapper onCloseDialog={onCloseDialog} conditionToOpenDialog={Boolean(columnBeingModified)}>
      <div className='flex flex-col items-start gap-5'>
        <SectionTitleAndDescription
          title='Columns'
          description="You won't usually need more than 3-4 columns, but you are free to add more."
        />
        <BoardSelector />
        <Columns />
        <AddNewColumnButton boardId={selectedBoard} />
        {columnBeingModified && (
          <ModifyColumnDialogContent
            key={key}
            onCloseDialog={onCloseDialog}
            boardId={selectedBoard}
            columnId={columnBeingModified}
          />
        )}
      </div>
    </ManageItemCardDialogWrapper>
  )
}
