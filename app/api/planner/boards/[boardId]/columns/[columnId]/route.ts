import { NextResponse } from 'next/server'

import { entityId } from '@/lib/apiSchemas'
import { ExtendedNextRequest, jsonError, Params, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'

export const DELETE = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req
    const boardIdResult = entityId.safeParse(params.boardId)
    if (!boardIdResult.success) {
      return jsonError(400, 'Invalid board id')
    }
    const columnIdResult = entityId.safeParse(params.columnId)
    if (!columnIdResult.success) {
      return jsonError(400, 'Invalid column id')
    }
    const boardId = boardIdResult.data
    const columnId = columnIdResult.data

    const planner = await Planner.findOne({ clerkUserId: userId }).lean()
    if (!planner || !planner.boards?.[boardId]) {
      return jsonError(404, 'Board not found')
    }
    const column = planner.columns?.[columnId]
    if (!column) {
      return jsonError(404, 'Column not found')
    }

    // Cascade: the column, its cards, and those cards' subtasks — all removed
    // in a single atomic update.
    const unset: Record<string, ''> = { [`columns.${columnId}`]: '' }
    for (const cardId of column.taskCards) {
      unset[`taskCards.${cardId}`] = ''
      for (const subTaskId of planner.taskCards?.[cardId]?.subTasks ?? []) {
        unset[`subTasks.${subTaskId}`] = ''
      }
    }

    const result = await Planner.updateOne(
      { clerkUserId: userId, [`columns.${columnId}.id`]: columnId },
      {
        $unset: unset,
        $pull: {
          [`boards.${boardId}.columns`]: columnId,
        },
      }
    )
    if (result.matchedCount === 0) {
      return jsonError(404, 'Column not found')
    }

    return NextResponse.json({ deleted: columnId })
  }
)
