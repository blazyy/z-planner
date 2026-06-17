import { NextResponse } from 'next/server'

import { UNASSIGNED_CATEGORY_ID } from '@/constants/constants'
import { boardPatch, entityId } from '@/lib/apiSchemas'
import { ExtendedNextRequest, jsonError, Params, parseBody, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'

/*
 * GET /api/planner/boards/[boardId] — returns ONE board's slice for the user.
 *
 * Dual-layer tenancy: the document is fetched by clerkUserId and the board is
 * resolved out of that document's `boards` map, so a board id belonging to a
 * different tenant resolves to undefined -> 404 (never another user's data).
 *
 * Pure read: unlike the collection GET (app/api/planner/route.ts) this does NOT
 * archive-on-read. It mirrors that route's 'created'-only card filter so the
 * board view shows the same active cards, while leaving 'completed'/'archived'
 * cards untouched in the document.
 *
 * Response is the normalized map shape the client already consumes, scoped to
 * the board: { board, columns, categories, taskCards, subTasks }. Column order
 * is carried by board.columns (an ordered id array); the maps are keyed by id.
 */
export const GET = withMiddleware(async (req: ExtendedNextRequest, { params }: { params: Params }) => {
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

  // Columns of this board, in board order, that still exist in the document.
  const columns: Record<string, (typeof planner.columns)[string]> = {}
  for (const columnId of board.columns) {
    const column = planner.columns?.[columnId]
    if (column) {
      columns[columnId] = column
    }
  }

  // Only 'created' cards in those columns — matches the collection GET filter.
  const taskCards: Record<string, (typeof planner.taskCards)[string]> = {}
  for (const columnId of board.columns) {
    for (const cardId of planner.columns?.[columnId]?.taskCards ?? []) {
      const card = planner.taskCards?.[cardId]
      if (card && card.status === 'created') {
        taskCards[cardId] = card
      }
    }
  }

  // Subtasks belonging to the included cards.
  const subTasks: Record<string, (typeof planner.subTasks)[string]> = {}
  for (const cardId of Object.keys(taskCards)) {
    for (const subTaskId of taskCards[cardId].subTasks ?? []) {
      const subTask = planner.subTasks?.[subTaskId]
      if (subTask) {
        subTasks[subTaskId] = subTask
      }
    }
  }

  // The board's categories.
  const categories: Record<string, (typeof planner.categories)[string]> = {}
  for (const categoryId of board.categories) {
    const category = planner.categories?.[categoryId]
    if (category) {
      categories[categoryId] = category
    }
  }

  return NextResponse.json({ board, columns, categories, taskCards, subTasks })
})

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
