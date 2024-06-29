import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { DEBOUNCE_TIME_MS } from '@/constants/constants'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { SubTaskInfoType } from '@/hooks/Planner/types'
import { useAuth } from '@clerk/nextjs'
import { DraggableProvided } from '@hello-pangea/dnd'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { debounce } from 'lodash'
import { GripVertical } from 'lucide-react'
import { useState } from 'react'
import { useErrorBoundary } from 'react-error-boundary'
import { handleKeyDownOnSubTask } from './utils'

type EditableSubTaskProps = {
  index: number
  provided: DraggableProvided
  taskCardId: string
  subTask: SubTaskInfoType
  isBeingDragged: boolean
}

const debouncedPatchTitle = debounce(async (subTaskId, newTitle, token) => {
  await axios.patch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/subtasks/${subTaskId}/title`,
    { newTitle },
    { headers: { Authorization: `Bearer ${token}` } }
  )
}, DEBOUNCE_TIME_MS)

export const EditableSubTask = ({ index, provided, taskCardId, subTask, isBeingDragged }: EditableSubTaskProps) => {
  const { isSubTaskBeingDragged, taskCards, subTasks } = usePlanner()
  const [showDragHandle, setShowDragHandle] = useState(isSubTaskBeingDragged)
  const dispatch = usePlannerDispatch()!
  const { getToken } = useAuth()
  const { showBoundary } = useErrorBoundary()

  const changeSubTaskCheckedStatusMutation = useMutation({
    mutationFn: async (payload: any) => {
      const token = await getToken()
      return axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/subtasks/${payload.subTaskId}/checked`,
        {
          isChecked: payload.isChecked,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
    },
    onMutate: async (payload) => {
      dispatch({
        type: 'subTasksCheckedStatusChanged',
        payload: {
          subTaskId: payload.subTaskId,
          isChecked: payload.isChecked,
        },
      })
    },
    onError: (err) => {
      dispatch({
        type: 'backendErrorOccurred',
      })
    },
  })

  const changeSubTaskTitleMutation = useMutation({
    mutationFn: async (payload: any) => {
      const token = await getToken()
      return debouncedPatchTitle(payload.subTaskId, payload.newTitle, token)
    },
    onMutate: async (payload) => {
      dispatch({
        type: 'subTaskTitleChanged',
        payload: {
          subTaskId: payload.subTaskId,
          newTitle: payload.newTitle,
        },
      })
    },
    onError: (err) => {
      dispatch({
        type: 'backendErrorOccurred',
      })
    },
  })

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={`flex gap-2 items-center ${isBeingDragged ? 'border-2 rounded-lg border-gray-400/50' : ''}`}
      onMouseEnter={() => {
        if (!isSubTaskBeingDragged) setShowDragHandle(true) // Only show drag handle on hover when another subtask isn't being actively dragged
      }}
      onMouseLeave={() => {
        setShowDragHandle(false)
      }}
    >
      <div {...provided.dragHandleProps} className={showDragHandle ? 'visible' : 'invisible'}>
        <GripVertical size={14} />
      </div>
      <Checkbox
        id={`${index}`}
        checked={subTask.checked}
        onCheckedChange={(isChecked) =>
          changeSubTaskCheckedStatusMutation.mutate({ subTaskId: subTask.id, isChecked: Boolean(isChecked) })
        }
      />
      <Input
        autoFocus
        id={subTask.id}
        type='text'
        value={subTask.title}
        className='my-1 px-1 border-none h-1 text-gray-500 text-sm focus-visible:ring-0 focus-visible:ring-transparent'
        onKeyDown={(event) =>
          handleKeyDownOnSubTask(taskCards, subTasks, taskCardId, subTask, event, dispatch, showBoundary)
        }
        onChange={(event) => changeSubTaskTitleMutation.mutate({ subTaskId: subTask.id, newTitle: event.target.value })}
      />
    </div>
  )
}
