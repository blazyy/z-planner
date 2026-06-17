import { NextResponse } from 'next/server'

import { ExtendedNextRequest, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'

/*
 * Maximum number of archived cards retained per planner document. Archiving is a
 * write-on-read side effect (completed cards become archived), so without a bound
 * the taskCards map would grow without limit. We keep the ARCHIVED_CARD_CAP
 * most-recent archived cards (by archivedAt) and purge the oldest beyond it in
 * the same atomic update that performs the archiving.
 *
 * Not exported: Next.js route modules only permit HTTP-method + config exports,
 * so this stays module-local. Tests assert against the literal value.
 */
const ARCHIVED_CARD_CAP = 200

/*
 * Soft ceiling on the serialized document size. MongoDB rejects any single
 * document over the 16MB BSON hard limit. We measure the lean doc's JSON byte
 * length as a cheap proxy and, when it crosses BSON_SOFT_LIMIT (1MB of margin
 * below the hard limit), purge archived cards more aggressively (down to
 * BSON_AGGRESSIVE_CAP) so a doc full of large archived cards can never wedge
 * against the hard limit.
 */
const BSON_SOFT_LIMIT = 15 * 1024 * 1024
const BSON_AGGRESSIVE_CAP = 50

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

  // Accumulate every mutation into a single atomic update with targeted paths
  // only — never overwrite whole maps, so concurrent writes to other
  // cards/columns are preserved. Mirrored onto `user` in memory so the response
  // reflects the persisted state without a re-read.
  const set: Record<string, string | Date> = {}
  const unset: Record<string, ''> = {}
  const pull: Record<string, { $in: string[] }> = {}

  // Cards completed since the last fetch get archived: they were shown in the UI
  // when completed, but on subsequent loads they only appear in the archive section.
  const newlyArchivedIds = Object.keys(user.taskCards).filter((taskId) => user.taskCards[taskId].status === 'completed')

  if (newlyArchivedIds.length > 0) {
    const now = new Date()
    for (const taskId of newlyArchivedIds) {
      set[`taskCards.${taskId}.status`] = 'archived'
      set[`taskCards.${taskId}.archivedAt`] = now
      user.taskCards[taskId].status = 'archived'
      user.taskCards[taskId].archivedAt = now
    }

    for (const columnId in user.columns) {
      const column = user.columns[columnId]
      const remaining = column.taskCards.filter((taskId) => !newlyArchivedIds.includes(taskId))
      if (remaining.length !== column.taskCards.length) {
        pull[`columns.${columnId}.taskCards`] = { $in: newlyArchivedIds }
        column.taskCards = remaining
      }
    }
  }

  // Bound archived-card growth. Consider ALL archived cards now present
  // (pre-existing + newly archived above), ordered most-recent-first by
  // archivedAt. Legacy archived cards with no archivedAt sort oldest (purged
  // first). Keep the cap; purge the rest by $unset-ing them from the map.
  const archived = Object.values(user.taskCards).filter((tc) => tc.status === 'archived')

  if (archived.length > 0) {
    // Tighten the cap when the document is approaching the BSON hard limit.
    const approxBytes = Buffer.byteLength(JSON.stringify(user), 'utf8')
    const effectiveCap =
      approxBytes > BSON_SOFT_LIMIT ? Math.min(ARCHIVED_CARD_CAP, BSON_AGGRESSIVE_CAP) : ARCHIVED_CARD_CAP

    if (archived.length > effectiveCap) {
      const recencyOf = (tc: (typeof archived)[number]) => (tc.archivedAt ? new Date(tc.archivedAt).getTime() : 0)
      // Most-recent first; id as a stable tiebreaker so the order is total and
      // deterministic across reads (avoids churn when archivedAt ties).
      const ordered = [...archived].sort(
        (a, b) => recencyOf(b) - recencyOf(a) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
      )
      const purgeIds = ordered.slice(effectiveCap).map((tc) => tc.id)

      for (const taskId of purgeIds) {
        unset[`taskCards.${taskId}`] = ''
        delete user.taskCards[taskId]
      }

      // Defensive: archived cards are removed from their column on archive, but
      // purge any dangling column references too so we never leave ids pointing
      // at deleted cards (legacy docs, or cards archived by older code paths).
      for (const columnId in user.columns) {
        const column = user.columns[columnId]
        const remaining = column.taskCards.filter((taskId) => !purgeIds.includes(taskId))
        if (remaining.length !== column.taskCards.length) {
          const existing = pull[`columns.${columnId}.taskCards`]
          pull[`columns.${columnId}.taskCards`] = { $in: [...(existing?.$in ?? []), ...purgeIds] }
          column.taskCards = remaining
        }
      }
    }
  }

  const update: Record<string, unknown> = {}
  if (Object.keys(set).length > 0) update.$set = set
  if (Object.keys(unset).length > 0) update.$unset = unset
  if (Object.keys(pull).length > 0) update.$pull = pull

  if (Object.keys(update).length > 0) {
    await Planner.updateOne({ clerkUserId: userId }, update)
  }

  // Only 'created' cards are returned; 'archived' ones stay in the document
  // for the future archive view to read.
  user.taskCards = Object.fromEntries(
    Object.entries(user.taskCards).filter(([, taskCard]) => taskCard.status === 'created')
  )

  return NextResponse.json(user)
})
