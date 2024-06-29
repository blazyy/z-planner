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

  const addNewSubTaskOnEnterKeydownMutation = useMutation({
    mutationFn: async (payload: any) => {
      const token = await getToken()
      return axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/cards/${taskCardId}/subtasks`,
        {
          newSubTaskDetails: payload.newSubTaskDetails,
          newSubTasksOrder: payload.newSubTasksOrder,
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
        type: 'newSubTaskAdded',
        payload: {
          taskCardId,
          newSubTaskDetails: payload.newSubTaskDetails,
          newSubTasksOrder: payload.newSubTasksOrder,
        },
      })
    },
    onError: (err) => {
      dispatch({
        type: 'backendErrorOccurred',
      })
    },
  })

  const deleteSubTaskMutation = useMutation({
    mutationFn: async (payload: any) => {
      const token = await getToken()
      const { subTaskId } = payload
      return axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/cards/${taskCardId}/subtasks/${subTaskId}/delete`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
    },
    onMutate: async (payload) => {
      dispatch({
        type: 'subTaskDeletedOnBackspaceKeydown',
        payload: {
          taskCardId,
          subTaskId: payload.subTaskId,
          newSubtasks: payload.newSubtasks,
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
        if (!isSubTaskBeingDragged) {
          setShowDragHandle(true) // Only show drag handle on hover when another subtask isn't being actively dragged
        }
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
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            /* Moves cursor focus to subtask below using the subtask ID */
            const subTaskIds = taskCards[taskCardId].subTasks
            const subTaskIndex = subTaskIds.findIndex((subTaskId) => subTaskId === subTask.id)
            if (subTaskIndex < subTaskIds.length - 1) {
              document.getElementById(subTaskIds[subTaskIndex + 1])?.focus()
            }
          } else if (event.key === 'ArrowUp') {
            /* Moves cursor focus to subtask below using the subtask ID */
            const subTaskIds = taskCards[taskCardId].subTasks
            const subTaskIndex = subTaskIds.findIndex((subTaskId) => subTaskId === subTask.id)
            if (subTaskIndex > 0) {
              document.getElementById(subTaskIds[subTaskIndex - 1])?.focus()
            }
          } else if (event.key === 'Enter') {
            const newSubTaskId = crypto.randomUUID()
            const newSubTasksOrder = Array.from(taskCards[taskCardId].subTasks)
            let subTaskIndex = newSubTasksOrder.findIndex((id: string) => id === subTask.id)
            newSubTasksOrder.splice(subTaskIndex + 1, 0, newSubTaskId)
            addNewSubTaskOnEnterKeydownMutation.mutate({
              newSubTaskDetails: {
                id: newSubTaskId,
                title: '',
                checked: false,
              },
              newSubTasksOrder,
            })
          } else if (event.key === 'Backspace' && subTask.title === '') {
            event.preventDefault() // Prevents the last character of the task from being delete when the cursor jumps to the task above
            // deleteSubTask(taskCards[taskCardId], subTask.id, dispatch, showBoundary)
            /* Moves cursor focus to subtask above using the subtask ID */
            const subTasksCopy = Array.from(taskCards[taskCardId].subTasks)
            const subTaskIndex = subTasksCopy.findIndex((id: string) => id === subTask.id)
            if (subTaskIndex > 0) {
              document.getElementById(subTasksCopy[subTaskIndex - 1])?.focus()
            }
            /* -------------------------------------------------------- */
            const newSubtasks = subTasksCopy.filter((id: string) => id !== subTask.id)
            deleteSubTaskMutation.mutate({
              subTaskId: subTask.id,
              newSubtasks,
            })
          }
        }}
        onChange={(event) => changeSubTaskTitleMutation.mutate({ subTaskId: subTask.id, newTitle: event.target.value })}
      />
    </div>
  )
}
