import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { DialogContent } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { DEBOUNCE_TIME_MS } from '@/constants/constants'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { useAuth } from '@clerk/nextjs'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import debounce from 'lodash/debounce'
import { useErrorBoundary } from 'react-error-boundary'
import { CategoryBadge } from '../CategoryBadge'
import { EditableSubTasks } from './EditableSubTasks/EditableSubTasks'

type TaskCardDialogProps = {
  boardId: string
  id: string
}

const debouncedPatchTitle = debounce(async (taskCardId, newTitle, token) => {
  await axios.patch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/cards/${taskCardId}/title`,
    { newTitle },
    { headers: { Authorization: `Bearer ${token}` } }
  )
}, DEBOUNCE_TIME_MS)

const debouncedPatchContent = debounce(async (taskCardId, newContent, token) => {
  await axios.patch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/cards/${taskCardId}/content`,
    { newContent },
    { headers: { Authorization: `Bearer ${token}` } }
  )
}, DEBOUNCE_TIME_MS)

export const TaskCardDialog = ({ boardId, id }: TaskCardDialogProps) => {
  const { showBoundary } = useErrorBoundary()
  const dispatch = usePlannerDispatch()!
  const { taskCards } = usePlanner()
  const { getToken } = useAuth()
  const task = taskCards[id]

  const changeCardCheckedStatusMutation = useMutation({
    mutationFn: async (payload: any) => {
      const token = await getToken()
      const { taskCardId, isChecked } = payload
      return axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/cards/${taskCardId}/checked`,
        {
          isChecked,
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
        type: 'taskCardCheckedStatusChanged',
        payload: payload,
      })
    },
    onError: (err) => {
      dispatch({
        type: 'backendErrorOccurred',
      })
    },
  })

  const changeCardTitleMutation = useMutation({
    mutationFn: async (payload: any) => {
      const token = await getToken()
      const { taskCardId, newTitle } = payload
      return debouncedPatchTitle(taskCardId, newTitle, token)
    },
    onMutate: async (payload) => {
      dispatch({
        type: 'taskCardTitleChanged',
        payload: payload,
      })
    },
    onError: (err) => {
      dispatch({
        type: 'backendErrorOccurred',
      })
    },
  })

  const changeCardContentMutation = useMutation({
    mutationFn: async (payload: any) => {
      const token = await getToken()
      const { taskCardId, newContent } = payload
      return debouncedPatchContent(taskCardId, newContent, token)
    },
    onMutate: async (payload) => {
      dispatch({
        type: 'taskCardContentChanged',
        payload: payload,
      })
    },
    onError: (err) => {
      dispatch({
        type: 'backendErrorOccurred',
      })
    },
  })

  return (
    <DialogContent className='p-0'>
      <Card className='p-2'>
        <CardHeader className='gap-2 pb-0 pl-7'>
          <div className='flex gap-2'>
            <CategoryBadge boardId={boardId} taskCardId={id} />
          </div>
          <CardTitle>
            <div className='flex flex-col gap-4'>
              <div className='flex items-center gap-2'>
                <Checkbox
                  className='w-5 h-5'
                  checked={task.checked}
                  onCheckedChange={(isChecked) => {
                    const payload = {
                      taskCardId: id,
                      isChecked: Boolean(isChecked),
                    }
                    changeCardCheckedStatusMutation.mutate(payload)
                  }}
                />
                <Textarea
                  value={task.title}
                  className='items-center p-0 border-none h-[35px] text-2xl focus-visible:ring-0 focus-visible:ring-transparent resize-y'
                  onChange={(event) => {
                    const payload = {
                      taskCardId: id,
                      newTitle: event.target.value,
                    }
                    changeCardTitleMutation.mutate(payload)
                  }}
                />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-6 px-4'>
          <EditableSubTasks taskCardId={id} />
          <Separator />
          <Textarea
            placeholder='Notes...'
            value={task.content}
            className='bg-neutral-100 m-1 min-h-fit focus-visible:ring-0 focus-visible:ring-transparent resize-y'
            onChange={(event) => {
              const payload = {
                taskCardId: id,
                newContent: event.target.value,
              }
              changeCardContentMutation.mutate(payload)
            }}
          />
        </CardContent>
        <CardFooter className='flex justify-between'>{/* <CategoryBadge taskCardId={id} /> */}</CardFooter>
      </Card>
    </DialogContent>
  )
}
