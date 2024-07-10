import { ExtendedNextRequest, Params, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

export const PATCH = withMiddleware(async (req: ExtendedNextRequest, { params }: { params: Params }) => {
  const { id } = params
  const { userId } = req
  const { newName } = await req.json()
  await Planner.updateOne(
    { clerkUserId: userId },
    {
      $set: {
        [`boards.${id}.name`]: newName,
      },
    }
  )
  return NextResponse.json({ status: 200, message: 'Board name changed successfully' })
})

export const DELETE = withMiddleware(async (req: ExtendedNextRequest, { params }: { params: Params }) => {
  const { userId } = req
  const { id } = params
  await Planner.updateOne(
    { clerkUserId: userId },
    {
      $pull: {
        boardOrder: id,
      },
      $unset: {
        [`boards.${id}`]: '',
      },
    }
  )
  return NextResponse.json({ status: 204, message: 'Board deleted successfully' })
})
