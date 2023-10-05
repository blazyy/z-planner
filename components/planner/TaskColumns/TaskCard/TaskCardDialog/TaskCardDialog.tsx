import { produce } from 'immer'
import { useContext } from 'react'

import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { DialogContent } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

import { PlannerContext } from '../../TaskColumns'
import { EditableSubTasks } from './EditableSubTasks'

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
          <CardTitle>
            <Textarea
              value={task.title}
              className='p-3 min-h-fit text-2xl border-2 focus-visible:ring-0 focus-visible:ring-transparent resize-y'
              onChange={(event) => {
                setData(
                  produce((draft) => {
                    draft.taskCards[id].title = event.target.value
                  })
                )
              }}
            />
          </CardTitle>
          <CardDescription className='m-0'>
            <Textarea
              value={task.content}
              className='p-3 min-h-fit border-2 focus-visible:ring-0 focus-visible:ring-transparent resize-y'
              onChange={(event) => {
                setData(
                  produce((draft) => {
                    draft.taskCards[id].content = event.target.value
                  })
                )
              }}
            />
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-2 px-2'>
          <EditableSubTasks taskCardId={id} />
        </CardContent>
        <CardFooter className='flex justify-between'>
          <Badge className='bg-emerald-500 hover:bg-emerald-600'>{task.category}</Badge>
          <Checkbox
            className='h-5 w-5'
            checked={task.checked}
            onCheckedChange={(isChecked) => {
              setData(
                produce((draft) => {
                  draft.taskCards[id].checked = Boolean(isChecked)
                })
              )
            }}
          />
        </CardFooter>
      </Card>
    </DialogContent>
  )
}
