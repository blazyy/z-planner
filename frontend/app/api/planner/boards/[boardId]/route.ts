import { ExtendedNextRequest, Params, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

export const PATCH = withMiddleware(async (req: ExtendedNextRequest, { params }: { params: Params }) => {
  const { userId } = req
  const { boardId } = params
  const { newName } = await req.json()
  await Planner.updateOne(
    { clerkUserId: userId },
    {
      $set: {
        [`boards.${boardId}.name`]: newName,
      },
    }
  )
  return NextResponse.json({ status: 200 })
})

export const DELETE = withMiddleware(async (req: ExtendedNextRequest, { params }: { params: Params }) => {
  const { userId } = req
  const { boardId } = params
  await Planner.updateOne(
    { clerkUserId: userId },
    {
      $pull: {
        boardOrder: boardId,
      },
      $unset: {
        [`boards.${boardId}`]: '',
      },
    }
  )
  return NextResponse.json({ status: 204 })
})
