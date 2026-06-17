import { NextResponse } from 'next/server'

import { UNASSIGNED_CATEGORY_ID } from '@/constants/constants'
import { boardPatch, entityId } from '@/lib/apiSchemas'
import { ExtendedNextRequest, jsonError, Params, parseBody, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'

export const PATCH = withMiddleware(async (req: ExtendedNextRequest, { params }: { params: Params }) => {
  const { userId } = req
  const boardIdResult = entityId.safeParse(params.boardId)
  if (!boardIdResult.success) {
    return jsonError(400, 'Invalid board id')
  }
  const boardId = boardIdResult.data
  const body = await parseBody(req, boardPatch)
  if (body.error) {
    return body.error
  }
  const { newName } = body.data

  const result = await Planner.updateOne(
    { clerkUserId: userId, [`boards.${boardId}.id`]: boardId },
    {
      $set: {
        [`boards.${boardId}.name`]: newName,
      },
    }
  )
  if (result.matchedCount === 0) {
    return jsonError(404, 'Board not found')
  }
  return NextResponse.json({ updated: boardId })
})

export const DELETE = withMiddleware(async (req: ExtendedNextRequest, { params }: { params: Params }) => {
  const { userId } = req
  const boardIdResult = entityId.safeParse(params.boardId)
  if (!boardIdResult.success) {
    return jsonError(400, 'Invalid board id')
  }
  const boardId = boardIdResult.data

  const planner = await Planner.findOne({ clerkUserId: userId }).lean()
  const board = planner?.boards?.[boardId]
  if (!planner || !board) {
    return jsonError(404, 'Board not found')
  }

  // Cascade: the board itself, its columns, their cards, those cards' subtasks,
  // and the board's categories — all removed in a single atomic update.
  const unset: Record<string, ''> = { [`boards.${boardId}`]: '' }
  for (const columnId of board.columns) {
    unset[`columns.${columnId}`] = ''
    for (const cardId of planner.columns?.[columnId]?.taskCards ?? []) {
      unset[`taskCards.${cardId}`] = ''
      for (const subTaskId of planner.taskCards?.[cardId]?.subTasks ?? []) {
        unset[`subTasks.${subTaskId}`] = ''
      }
    }
  }
  // The 'unassigned' category id is shared by every board, so it only goes when
  // this is the last board standing.
  const otherBoardExists = Object.keys(planner.boards).some((id) => id !== boardId)
  for (const categoryId of board.categories) {
    if (categoryId === UNASSIGNED_CATEGORY_ID && otherBoardExists) {
      continue
    }
    unset[`categories.${categoryId}`] = ''
  }

  const result = await Planner.updateOne(
    { clerkUserId: userId, [`boards.${boardId}.id`]: boardId },
    {
      $unset: unset,
      $pull: {
        boardOrder: boardId,
      },
    }
  )
  if (result.matchedCount === 0) {
    return jsonError(404, 'Board not found')
  }
  return NextResponse.json({ deleted: boardId })
})
