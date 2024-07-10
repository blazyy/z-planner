import { ExtendedNextRequest, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

export const GET = withMiddleware(async (req: ExtendedNextRequest) => {
  const { userId } = req
  let user = await Planner.findOne({ clerkUserId: userId }).lean()
  if (!user) {
    user = new Planner({
      clerkUserId: userId,
      boardOrder: [],
      boards: {},
      columns: {},
      categories: {},
      taskCards: {},
      subTasks: {},
    })
    await user.save()
    user = user.toObject()
  }
  return NextResponse.json(user)
})
