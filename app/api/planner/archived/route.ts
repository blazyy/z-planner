import { NextResponse } from 'next/server'

import { archivedQuery } from '@/lib/apiSchemas'
import { ExtendedNextRequest, jsonError, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'

/*
 * GET /api/planner/archived — paginated list of the user's ARCHIVED cards.
 *
 * The collection GET (app/api/planner/route.ts) flips 'completed' cards to
 * 'archived' on read and then hides them from its payload while retaining them
 * in the document. This route surfaces that retained set for an archive view.
 *
 * Tenancy: scoped to clerkUserId only — archived cards are detached from any
 * column (the collection GET $pulls them out), so there is no nested entity to
 * existence-check; the user's own document is the only data touched.
 *
 * Ordering is deterministic: newest first. The model carries no archivedAt
 * timestamp on individual cards, so "newest first" is realized as descending
 * card id (client-minted ids are fixed-width, so lexicographic == stable).
 *
 * Pagination is cursor-based. `cursor` is the last id of the previous page; the
 * next page is the cards with id strictly less than it (descending). The
 * response carries nextCursor (null when exhausted) and hasMore.
 */
export const GET = withMiddleware(async (req: ExtendedNextRequest) => {
  const { userId } = req

  const queryResult = archivedQuery.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!queryResult.success) {
    const issues = queryResult.error.issues.map((issue) => `${issue.path.join('.') || 'query'}: ${issue.message}`)
    return jsonError(400, `Invalid query — ${issues.join('; ')}`)
  }
  const { limit, cursor } = queryResult.data

  const planner = await Planner.findOne({ clerkUserId: userId }).lean()
  const taskCards = planner?.taskCards ?? {}

  // All archived ids, newest first (descending id). Stable + deterministic.
  let archivedIds = Object.keys(taskCards)
    .filter((id) => taskCards[id].status === 'archived')
    .sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))

  // Cursor: drop everything up to and including the cursor id.
  if (cursor !== undefined) {
    const cursorIndex = archivedIds.indexOf(cursor)
    archivedIds = cursorIndex === -1 ? [] : archivedIds.slice(cursorIndex + 1)
  }

  const pageIds = archivedIds.slice(0, limit)
  const hasMore = archivedIds.length > limit
  const nextCursor = hasMore ? pageIds[pageIds.length - 1] : null

  const cards = pageIds.map((id) => taskCards[id])

  return NextResponse.json({ cards, nextCursor, hasMore })
})
