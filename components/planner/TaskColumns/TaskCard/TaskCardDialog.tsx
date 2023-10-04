import { produce } from 'immer'
import { useContext } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { DialogContent } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

import { SubTasks } from './SubTasks'
import { PlannerContext } from '../TaskColumns'

type TaskCardDialogProps = {
  id: string
}

export const TaskCardDialog = ({ id }: TaskCardDialogProps) => {
  const { data, setData } = useContext(PlannerContext)!
  const task = data.taskCards[id]
  return (
    <DialogContent className='p-0'>
      <Card>
        <CardHeader className='p-4'>
          <CardTitle>{task.title}</CardTitle>
          <CardDescription>{task.content}</CardDescription>
        </CardHeader>
        {task.subTasks.length > 0 && (
          <CardContent className='flex flex-col gap-2'>
            <SubTasks taskCardId={id} />
          </CardContent>
        )}
        <CardFooter className='flex justify-between'>
          <Checkbox
            checked={task.checked}
            onCheckedChange={(isChecked) => {
              setData(
                produce((draft) => {
                  draft.taskCards[id].checked = Boolean(isChecked)
                })
              )
            }}
          />
          <p className='text-sm text-right text-emerald-500'># {task.category}</p>
        </CardFooter>
      </Card>
    </DialogContent>
  )
}
