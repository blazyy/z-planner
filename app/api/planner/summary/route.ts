import { NextResponse } from 'next/server'

import { ExtendedNextRequest, withMiddleware } from '@/lib/middleware'
import { buildStarterPlanner } from '@/lib/starterPlanner'
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
  // withAuth (in withMiddleware) 401s before this handler runs when unauthed, so
  // userId is guaranteed present here.
  const userId = req.userId as string

  // Race-proof get-or-create: the unique index on clerkUserId guarantees that
  // concurrent first loads converge on a single document. A BRAND-NEW user is
  // seeded with the same starter board the collection GET seeds (shared
  // buildStarterPlanner) so the two endpoints never drift; existing users keep
  // their data untouched because $setOnInsert is a no-op on update.
  const user = await Planner.findOneAndUpdate(
    { clerkUserId: userId },
    { $setOnInsert: buildStarterPlanner(userId) },
    { upsert: true, new: true }
  ).lean()

  return NextResponse.json({
    boardOrder: user.boardOrder,
    boards: user.boards,
    categories: user.categories,
  })
})
