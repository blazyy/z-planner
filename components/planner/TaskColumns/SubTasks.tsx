import { produce } from 'immer'
import { useContext } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { MdDragIndicator, MdAddCircleOutline } from 'react-icons/md'

import { PlannerContext } from './TaskColumns'
import { Droppable, Draggable } from '@hello-pangea/dnd'

type SubTasksProps = {
  taskCardId: string
}

export const SubTasks = ({ taskCardId }: SubTasksProps) => {
  const { data, setData } = useContext(PlannerContext)!
  const subTasks = data.taskCards[taskCardId].subTasks.map((subTaskId) => data.subTasks[subTaskId])

  return (
    <div>
      {subTasks.map((subTask, index) => (
        <div key={subTask.id} className='flex gap-2 items-center'>
          <Checkbox
            id={`${index}`}
            className='text-gray-500'
            checked={subTask.checked}
            onCheckedChange={(isChecked) => {
              setData(
                produce((draft) => {
                  draft.subTasks[subTask.id].checked = Boolean(isChecked)
                })
              )
            }}
          />
          <label htmlFor={subTask.id} className={`text-sm text-gray-500 ${subTask.checked ? 'line-through' : ''}`}>
            {subTask.title}
          </label>
        </div>
      ))}
    </div>
  )
}

{
  /* <>
<Droppable droppableId={taskCardId} type='subtask'>
  {(provided, snapshot) => (
    <div
      ref={provided.innerRef}
      {...provided.droppableProps}
      className={`p-2 rounded-md ${snapshot.isDraggingOver ? 'bg-gray-100' : ''}`}
    >
      {subTasks.map((subTask, index) => (
        <Draggable key={subTask.id} draggableId={`${taskCardId}~${subTask.id}`} index={index}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.draggableProps} className='flex gap-2 items-center'>
              <div {...provided.dragHandleProps}>
                <MdDragIndicator />
              </div>
              <Checkbox
                id={`${index}`}
                className='text-gray-500'
                checked={subTask.checked}
                onCheckedChange={(isChecked) => {
                  setData(
                    produce((draft) => {
                      draft.subTasks[subTask.id].checked = Boolean(isChecked)
                    })
                  )
                }}
              />
              <label
                htmlFor={subTask.id}
                className={`text-sm text-gray-500 ${subTask.checked ? 'line-through' : ''}`}
              >
                {subTask.title}
              </label>
            </div>
          )}
        </Draggable>
      ))}
      {provided.placeholder}
    </div>
  )}
</Droppable>
</> */
}
