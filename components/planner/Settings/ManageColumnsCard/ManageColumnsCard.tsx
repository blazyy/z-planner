import { Dispatch, SetStateAction, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePlanner } from '@/hooks/Planner/Planner'
import { BoardInfoType, BoardsType, ColumnsType } from '@/hooks/Planner/types'

import { ManageItemCardDialogWrapper } from '../ManageItemCardDialogWrapper'
import { SectionTitleAndDescription } from '../SectionTitleAndDescription'
import { AddNewColumnButton } from './AddNewColumnButton'
import { ModifyColumnDialogContent } from './ModifyColumnDialogContent'

type BoardSelectorProps = {
  boardOrder: string[]
  boards: BoardsType
  selectedBoard: string
  setSelectedBoard: Dispatch<SetStateAction<string>>
}

const BoardSelector = ({ boardOrder, boards, selectedBoard, setSelectedBoard }: BoardSelectorProps) => {
  return (
    <div className='flex flex-col gap-2 w-96'>
      <Label htmlFor='board-selector'>Board</Label>
      <Select onValueChange={(value) => setSelectedBoard(value)} value={selectedBoard}>
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

type ColumnsProps = {
  board: BoardInfoType | undefined
  columns: ColumnsType
  setColumnBeingModified: Dispatch<SetStateAction<string>>
}

const Columns = ({ board, columns, setColumnBeingModified }: ColumnsProps) => {
  if (!board || board.columns.length === 0) {
    return <span className='text-neutral-500 dark:text-neutral-400 text-sm'>No columns yet</span>
  }
  return (
    <div className='flex flex-row gap-2'>
      {board.columns.map((columnId: string) => {
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

export const ManageColumnsCard = () => {
  const { boardOrder, boards, columns } = usePlanner()
  const [selectedBoard, setSelectedBoard] = useState(boardOrder[0])
  const [columnBeingModified, setColumnBeingModified] = useState('')
  const [key, setKey] = useState(0)

  // The selected board can be deleted from the boards card above; fall back to
  // the first board so we never index `boards` with a stale id.
  const activeBoardId = boards[selectedBoard] ? selectedBoard : boardOrder[0]

  const onCloseDialog = () => {
    setColumnBeingModified('')
    setKey((prevKey) => prevKey + 1) // Resets unsaved changes in dialog when cancel button is clicked
  }

  return (
    <ManageItemCardDialogWrapper onCloseDialog={onCloseDialog} conditionToOpenDialog={Boolean(columnBeingModified)}>
      <div className='flex flex-col items-start gap-5'>
        <SectionTitleAndDescription
          title='Columns'
          description="You won't usually need more than 3-4 columns, but you are free to add more."
        />
        <BoardSelector
          boardOrder={boardOrder}
          boards={boards}
          selectedBoard={activeBoardId}
          setSelectedBoard={setSelectedBoard}
        />
        <Columns board={boards[activeBoardId]} columns={columns} setColumnBeingModified={setColumnBeingModified} />
        <AddNewColumnButton boardId={activeBoardId} />
        {columnBeingModified && (
          <ModifyColumnDialogContent
            key={key}
            onCloseDialog={onCloseDialog}
            boardId={activeBoardId}
            columnId={columnBeingModified}
          />
        )}
      </div>
    </ManageItemCardDialogWrapper>
  )
}
