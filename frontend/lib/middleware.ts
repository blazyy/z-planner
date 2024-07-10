// utils/middleware.ts
import dbConnect from '@/lib/dbConnect'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export interface ExtendedNextRequest extends NextRequest {
  userId?: string
}

export interface Params {
  id: string
}

export interface ExtendedNextContext {
  params: Params
}

type Handler = (req: ExtendedNextRequest, context: ExtendedNextContext) => Promise<NextResponse>

export function withDbConnect(handler: Handler): Handler {
  return async (req, context) => {
    try {
      await dbConnect()
      return handler(req, context)
    } catch (error) {
      return NextResponse.json({ status: 500, error: 'Internal Server Error' })
    }
  }
}

export function withAuth(handler: Handler): Handler {
  return async (req, context) => {
    try {
      const authObj = auth()
      const { userId } = authObj
      if (!userId) {
        return NextResponse.json({ status: 401, error: 'Unauthorized' })
      }
      req.userId = userId
      return handler(req, context)
    } catch (error) {
      return NextResponse.json({ status: 500, error: 'Internal Server Error' })
    }
  }
}

export function withMiddleware(handler: Handler): Handler {
  return withAuth(withDbConnect(handler))
}
