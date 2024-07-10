import { ExtendedNextRequest, Params, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

interface SubTaskModificationRequestBody {
  title?: string
  checked?: boolean
}

export const PATCH = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req
    const { subTaskId } = params
    const body: SubTaskModificationRequestBody = await req.json()

    const [key, value] = Object.entries(body)[0]
    const updateField = { [`subTasks.${subTaskId}.${key}`]: value }

    await Planner.updateOne(
      { clerkUserId: userId },
      {
        $set: updateField,
      }
    )

    return NextResponse.json({ status: 204 })
  }
)
