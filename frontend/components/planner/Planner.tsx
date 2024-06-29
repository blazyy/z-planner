'use client'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { PlannerFiltersProvider } from '@/hooks/PlannerFilters/PlannerFilters'
import { useAuth } from '@clerk/nextjs'
import { DragDropContext } from '@hello-pangea/dnd'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { BackendErrorAlertCard } from '../global/AlertCard/AlertCard'
import { AddBoardCallout } from './AddBoardCallout'
import { Board } from './Board/Board'
import { Sidebar } from './Sidebar/Sidebar'

export const Planner = () => {
  const plannerContext = usePlanner()
  const dispatch = usePlannerDispatch()
  const { getToken } = useAuth()

  const reorderSubTasksMutation = useMutation({
    mutationFn: async (payload: any) => {
      const token = await getToken()
      const { taskCardId, reorderedSubTasks } = payload
      return axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/cards/${taskCardId}/subtasks/move`,
        {
          reorderedSubTasks,
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
        type: 'subTasksReordered',
        payload: payload,
      })
      dispatch({
        type: 'subTaskDragStatusChanged',
        payload: false,
      })
    },
    onError: (err) => {
      dispatch({
        type: 'backendErrorOccurred',
      })
    },
  })

  const changeColumnOrderMutation = useMutation({
    mutationFn: async (payload: any) => {
      const token = await getToken()
      const { boardId, newColumnOrder } = payload
      return axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/boards/${boardId}/columns/reorder`,
        {
          newColumnOrder,
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
        type: 'columnsReordered',
        payload: payload,
      })
    },
    onError: (err) => {
      dispatch({
        type: 'backendErrorOccurred',
      })
    },
  })

  const moveCardWithinColumnMutation = useMutation({
    mutationFn: async (payload: any) => {
      const token = await getToken()
      const { columnId, reorderedCardIds } = payload
      return axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/columns/${columnId}/cards/move`,
        {
          reorderedCardIds,
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
        type: 'cardMovedWithinColumn',
        payload: payload,
      })
    },
    onError: (err) => {
      dispatch({
        type: 'backendErrorOccurred',
      })
    },
  })

  const moveCardAcrossColumnsMutation = useMutation({
    mutationFn: async (payload: any) => {
      const token = await getToken()
      const { sourceColumnId, destColumnId, sourceColumnTaskCardIds, destColumnTaskCardIds } = payload
      return axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/columns/move`,
        {
          sourceColumnId,
          destColumnId,
          sourceColumnTaskCardIds,
          destColumnTaskCardIds,
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
        type: 'cardMovedAcrossColumns',
        payload: payload,
      })
    },
    onError: (err) => {
      dispatch({
        type: 'backendErrorOccurred',
      })
    },
  })

  if (plannerContext.backendErrorOccurred) {
    return <BackendErrorAlertCard />
  }

  if (plannerContext.boardOrder.length === 0) {
    return <AddBoardCallout />
  }

  return (
    <main id='planner' className='flex flex-col flex-1 justify-start items-center w-full'>
      {plannerContext.boardOrder.length > 0 && plannerContext.selectedBoard && (
        <DragDropContext
          onDragStart={(dragStartObj) => {
            if (dragStartObj.type === 'subtask') {
              dispatch({
                type: 'subTaskDragStatusChanged',
                payload: true,
              })
            }
            if (dragStartObj.type === 'card') {
              dispatch({
                type: 'idOfCardBeingDraggedChanged',
                payload: dragStartObj.draggableId,
              })
            }
          }}
          onDragEnd={(result) =>
            // handleOnDragEnd(result, plannerDispatch, plannerContext, showBoundary, plannerContext.selectedBoard)
            {
              const { destination, source, draggableId, type } = result
              const { boards, columns, taskCards } = plannerContext

              // If there's no destination or if card is in original position from where it was dragged from, do nothing
              if (
                !destination ||
                (destination.droppableId === source.droppableId && destination.index === source.index)
              ) {
                return
              }

              if (type === 'subtask') {
                const [taskCardId, subTaskId] = draggableId.split('~')
                const reorderedSubTasks = Array.from(taskCards[taskCardId].subTasks)
                reorderedSubTasks.splice(source.index, 1)
                reorderedSubTasks.splice(destination.index, 0, subTaskId)
                reorderSubTasksMutation.mutate({
                  taskCardId,
                  reorderedSubTasks,
                })
              }

              if (type === 'column') {
                const boardId = plannerContext.selectedBoard
                const newColumnOrder = Array.from(boards[boardId].columns)
                newColumnOrder.splice(source.index, 1)
                newColumnOrder.splice(destination.index, 0, draggableId)
                return changeColumnOrderMutation.mutate({
                  boardId,
                  newColumnOrder: Array.from(boards[boardId].columns),
                })
              }

              dispatch({
                type: 'idOfCardBeingDraggedChanged',
                payload: '',
              })

              // Moving a card within the same column
              if (columns[source.droppableId] === columns[destination.droppableId]) {
                const startingColumn = columns[source.droppableId]
                const reorderedCardIds = Array.from(startingColumn.taskCards) // Copy of taskCards
                reorderedCardIds.splice(source.index, 1)
                reorderedCardIds.splice(source.index, 0, draggableId)
                return moveCardWithinColumnMutation.mutate({
                  columnId: source.droppableId,
                  reorderedCardIds,
                })
              }

              // Moving cards between columns
              const sourceColumnId = source.droppableId
              const sourceColumn = columns[sourceColumnId]
              const sourceColumnTaskCardIds = Array.from(sourceColumn.taskCards) // Copy of taskCards
              sourceColumnTaskCardIds.splice(source.index, 1)
              const destColumnId = destination.droppableId
              const destColumn = columns[destColumnId]
              const destColumnTaskCardIds = Array.from(destColumn.taskCards)
              destColumnTaskCardIds.splice(destination.index, 0, draggableId)
              return moveCardAcrossColumnsMutation.mutate({
                sourceColumnId,
                destColumnId,
                sourceColumnTaskCardIds,
                destColumnTaskCardIds,
              })
            }
          }
        >
          <div className='flex justify-between gap-2 w-full h-full'>
            <PlannerFiltersProvider>
              <Sidebar />
              <Board boardId={plannerContext.selectedBoard} />
            </PlannerFiltersProvider>
          </div>
        </DragDropContext>
      )}
    </main>
  )
}
