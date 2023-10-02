import { produce } from 'immer'
import { useContext } from 'react'
import { Draggable } from '@hello-pangea/dnd'

import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { PlannerContext } from './TaskColumns'

type TaskCardProps = {
  index: number
  id: string
  title: string
  category: string
  content: string
  checked: boolean
}

export const TaskCard = ({ index, id, title, category, content, checked }: TaskCardProps) => {
  const { setData } = useContext(PlannerContext)!
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
          <Card className={`border-stone-400 mb-2 ${snapshot.isDragging ? '' : ''}`}>
            <CardHeader>
              <div className='flex flex-row justify-between'>
                <CardTitle>{title}</CardTitle>
              </div>
              <CardDescription>{content}</CardDescription>
            </CardHeader>
            {/* <CardContent></CardContent> */}
            <CardFooter className='flex justify-between'>
              <Checkbox
                checked={checked}
                onCheckedChange={(isChecked) => {
                  setData(
                    produce((draft) => {
                      draft.cards[id].checked = Boolean(isChecked)
                    })
                  )
                }}
              />
              <p className='text-xs text-right text-green-700'>{category}</p>
            </CardFooter>
          </Card>
        </div>
      )}
    </Draggable>
  )
}
