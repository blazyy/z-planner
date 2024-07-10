import dbConnect from '@/lib/dbConnect'
import Planner from '@/models/Planner'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  await dbConnect()

  const { userId } = auth()

  if (!userId) {
    return Response.json({ status: 401, error: 'Unauthorized' })
  }

  let user = await Planner.findOne({ clerkUserId: userId }).lean()
  if (!user) {
    // If user doesn't exist, create a new one
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
}
