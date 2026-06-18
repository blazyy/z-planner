import { NextResponse } from 'next/server'

import { ExtendedNextRequest, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'

/*
 * GET /api/planner/summary — the LIGHT first-load payload.
 *
 * Returns only the board metadata the sidebar needs up front:
 * { boardOrder, boards, categories }. Columns, taskCards and subTasks are
 * deliberately omitted; each board's heavy slice is fetched lazily on demand via
 * GET /api/planner/boards/[boardId] when the user opens it.
 *
 * Reuses the collection route's race-proof get-or-create upsert and clerkUserId
 * scoping (app/api/planner/route.ts), so a first-time user still converges on a
 * single document. Unlike the collection GET this is a PURE read of board
 * metadata: it performs no archive-on-read side effect, because it never touches
 * cards.
 */
export const GET = withMiddleware(async (req: ExtendedNextRequest) => {
  const { userId } = req

  // Race-proof get-or-create: the unique index on clerkUserId guarantees that
  // concurrent first loads converge on a single document.
  const user = await Planner.findOneAndUpdate(
    { clerkUserId: userId },
    {
      $setOnInsert: {
        clerkUserId: userId,
        boardOrder: [],
        boards: {},
        columns: {},
        categories: {},
        taskCards: {},
        subTasks: {},
      },
    },
    { upsert: true, new: true }
  ).lean()

  return NextResponse.json({
    boardOrder: user.boardOrder,
    boards: user.boards,
    categories: user.categories,
  })
})
