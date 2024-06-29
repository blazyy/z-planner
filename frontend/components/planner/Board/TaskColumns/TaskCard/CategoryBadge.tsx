import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { useAuth } from '@clerk/nextjs'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { badgeClassNames } from './utils'

type CategoryBadgeProps = {
  boardId: string
  taskCardId: string
}

export const CategoryBadge = ({ boardId, taskCardId }: CategoryBadgeProps) => {
  const dispatch = usePlannerDispatch()!
  const { boards, taskCards, categories } = usePlanner()
  const { getToken } = useAuth()

  const categoryInfo = categories[taskCards[taskCardId].category]
  const categoriesInBoard = boards[boardId].categories

  const changeCardCategoryMutation = useMutation({
    mutationFn: async (payload: any) => {
      const token = await getToken()
      const { taskCardId, newCategoryId } = payload
      return axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/cards/${taskCardId}/category`,
        {
          newCategoryId,
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
        type: 'taskCategoryChanged',
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
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Badge className={badgeClassNames[categoryInfo.color]}>{categoryInfo.name}</Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        {categoriesInBoard.map((categoryId, index) => (
          <DropdownMenuCheckboxItem
            key={index}
            checked={categoryInfo.name === categories[categoryId].name}
            onClick={(event) => {
              event.preventDefault()
              const payload = {
                taskCardId,
                newCategoryId: categoryId,
              }
              changeCardCategoryMutation.mutate(payload)
            }}
          >
            <Badge className={badgeClassNames[categories[categoryId].color]}>{categories[categoryId].name}</Badge>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
