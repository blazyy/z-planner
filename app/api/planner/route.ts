import { NextResponse } from 'next/server'

import { ExtendedNextRequest, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'

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

  // Cards completed since the last fetch get archived: they were shown in the UI
  // when completed, but on subsequent loads they only appear in the archive section.
  const archivedIds = Object.keys(user.taskCards).filter((taskId) => user.taskCards[taskId].status === 'completed')

  if (archivedIds.length > 0) {
    const set: Record<string, string> = {}
    const pull: Record<string, { $in: string[] }> = {}

    for (const taskId of archivedIds) {
      set[`taskCards.${taskId}.status`] = 'archived'
      user.taskCards[taskId].status = 'archived'
    }

    for (const columnId in user.columns) {
      const column = user.columns[columnId]
      const remaining = column.taskCards.filter((taskId) => !archivedIds.includes(taskId))
      if (remaining.length !== column.taskCards.length) {
        pull[`columns.${columnId}.taskCards`] = { $in: archivedIds }
        column.taskCards = remaining
      }
    }

    // Targeted paths only — never overwrite whole maps, so concurrent writes
    // to other cards/columns are preserved.
    await Planner.updateOne(
      { clerkUserId: userId },
      Object.keys(pull).length > 0 ? { $set: set, $pull: pull } : { $set: set }
    )
  }

  // Only 'created' cards are returned; 'archived' ones stay in the document
  // for the future archive view to read.
  user.taskCards = Object.fromEntries(
    Object.entries(user.taskCards).filter(([, taskCard]) => taskCard.status === 'created')
  )

  return NextResponse.json(user)
})
