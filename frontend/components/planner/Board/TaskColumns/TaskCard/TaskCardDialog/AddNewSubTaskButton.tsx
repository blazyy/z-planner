import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { useAuth } from '@clerk/nextjs'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { GripVertical, PlusCircle } from 'lucide-react'
import { useState } from 'react'

type AddNewSubTaskButtonProps = {
  taskCardId: string
}

export const AddNewSubTaskButton = ({ taskCardId }: AddNewSubTaskButtonProps) => {
  const dispatch = usePlannerDispatch()
  const [isHoveringOver, setIsHoveringOver] = useState(false)
  const { taskCards, isSubTaskBeingDragged } = usePlanner()
  const { getToken } = useAuth()

  const addNewSubTaskOnButtonClickMutation = useMutation({
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

  return (
    <div
      className='flex items-center gap-2 mt-1 hover:cursor-pointer'
      onMouseEnter={() => setIsHoveringOver(true)}
      onMouseLeave={() => setIsHoveringOver(false)}
      onClick={() => {
        const newSubTaskId = crypto.randomUUID()
        const newSubTasksOrder = Array.from(taskCards[taskCardId].subTasks)
        newSubTasksOrder.push(newSubTaskId)
        addNewSubTaskOnButtonClickMutation.mutate({
          newSubTaskDetails: {
            id: newSubTaskId,
            title: '',
            checked: false,
          },
          newSubTasksOrder,
        })
      }}
    >
      <GripVertical size={12} className='invisible' />
      <PlusCircle
        size={20}
        className={`${isHoveringOver && !isSubTaskBeingDragged ? 'text-blue-500' : 'text-gray-400'}`}
      />
      <span className={`ml-2 text-sm ${isHoveringOver && !isSubTaskBeingDragged ? 'text-blue-500' : 'text-gray-400'}`}>
        Add subtask
      </span>
    </div>
  )
}
