import { Checkbox } from '@/components/ui/checkbox'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { useAuth } from '@clerk/nextjs'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

type SubTasksProps = {
  taskCardId: string
}

export const SubTasks = ({ taskCardId }: SubTasksProps) => {
  const dispatch = usePlannerDispatch()
  const { taskCards, subTasks } = usePlanner()
  const subTasksUnderTaskCard = taskCards[taskCardId].subTasks.map((subTaskId) => subTasks[subTaskId])
  const { getToken } = useAuth()
  const isEditable = !taskCards[taskCardId].checked

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

  return (
    <div>
      {subTasksUnderTaskCard.map((subTask, index) => (
        <div key={subTask.id} className='flex items-center gap-2'>
          <Checkbox
            id={`${index}`}
            checked={subTask.checked}
            onClick={(event) => {
              if (isEditable) {
                event.preventDefault() // Neede to prevent dialog from triggering
                const isChecked = (event.target as HTMLButtonElement).getAttribute('data-state') === 'checked'
                changeSubTaskCheckedStatusMutation.mutate({ subTaskId: subTask.id, isChecked: !isChecked })
              }
            }}
          />
          <label htmlFor={subTask.id} className='text-gray-500 text-sm cursor-pointer'>
            {subTask.title}
          </label>
        </div>
      ))}
    </div>
  )
}
