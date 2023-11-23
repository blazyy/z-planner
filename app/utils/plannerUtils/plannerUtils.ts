import { GetNewColumnOrderFunc } from './types'

export const changeColumnOrder: GetNewColumnOrderFunc = async (
  dispatch,
  boards,
  boardId,
  draggableId,
  sourceIndex,
  destIndex
) => {
  const newColumnOrder = Array.from(boards[boardId].columns)
  newColumnOrder.splice(sourceIndex, 1)
  newColumnOrder.splice(destIndex, 0, draggableId)

  dispatch({
    type: 'columnsReordered',
    payload: {
      boardId,
      newColumnOrder,
    },
  })

  await fetch('/api/planner/changeColumnOrder', {
    method: 'POST',
    body: JSON.stringify({ newColumnOrder }),
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
    })
    .catch((error) => {
      console.error('Error fetching initial planner data:', error)
    })
}
