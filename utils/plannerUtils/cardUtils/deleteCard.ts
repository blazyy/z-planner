import axios from 'axios'

import { PlannerDispatchContextType, TaskCardInfoType } from '@/hooks/Planner/types'

import { sendMutation } from '../apiClient'

export default function deleteCard(
  columnId: string,
  taskCardId: string,
  dispatch: PlannerDispatchContextType,
  boardId: string
) {
  dispatch({
    type: 'taskCardDeleted',
    payload: {
      columnId,
      taskCardId,
    },
  })
  sendMutation(dispatch, () => axios.delete(`/api/planner/columns/${columnId}/cards/${taskCardId}`), boardId)
}

/*
 * Undo a deleteCard: put a just-deleted card back where it was. The delete
 * already persisted (DELETE fired immediately), so this re-creates the card
 * server-side with its ORIGINAL client-minted id — ids are stable, so a
 * same-id $set restores the card identically rather than spawning a duplicate.
 *
 * Mirrors addNewCardToColumn's request shape (POST /columns/:id/cards with
 * { newTaskCardDetails, updatedTaskCards }) but splices the id back in at its
 * original index instead of prepending, so order is preserved. currentTaskCards
 * is the column's order AS IT IS NOW (post-delete), captured at undo time so the
 * splice lands relative to the live order.
 */
export function restoreCard(
  columnId: string,
  card: TaskCardInfoType,
  originalIndex: number,
  currentTaskCards: string[],
  dispatch: PlannerDispatchContextType,
  boardId: string
) {
  const updatedTaskCards = Array.from(currentTaskCards)
  // Clamp to the current length: if cards shifted while the toast was up, the
  // original index may now be past the end; splice then inserts at the tail.
  const insertAt = Math.min(originalIndex, updatedTaskCards.length)
  updatedTaskCards.splice(insertAt, 0, card.id)
  dispatch({
    type: 'newTaskCardAdded',
    payload: {
      columnId,
      newTaskCardDetails: card,
      updatedTaskCards,
    },
  })
  sendMutation(
    dispatch,
    () =>
      axios.post(`/api/planner/columns/${columnId}/cards`, {
        newTaskCardDetails: card,
        updatedTaskCards,
      }),
    boardId
  )
}
