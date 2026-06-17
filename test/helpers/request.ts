import { NextRequest, NextResponse } from 'next/server'

import type { ExtendedNextContext, ExtendedNextRequest, Params } from '@/lib/middleware'

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE'

interface BuildRequestOptions {
  method?: Method
  /** Path or absolute url. A bare path is resolved against http://localhost. */
  url?: string
  /** JSON body. Serialized and sent verbatim; omit for GET/DELETE. */
  body?: unknown
  /** Override the raw body string (use to exercise malformed-JSON paths). */
  rawBody?: string
  headers?: Record<string, string>
}

/** Construct a NextRequest the route handlers can consume in-process. */
export function buildRequest(options: BuildRequestOptions = {}): ExtendedNextRequest {
  const { method = 'GET', url = '/api/planner', body, rawBody, headers = {} } = options
  const absolute = url.startsWith('http') ? url : `http://localhost${url.startsWith('/') ? '' : '/'}${url}`

  const init: { method: Method; headers: Record<string, string>; body?: string } = {
    method,
    headers: { ...headers },
  }

  if (rawBody !== undefined) {
    init.body = rawBody
    init.headers['content-type'] ??= 'application/json'
  } else if (body !== undefined) {
    init.body = JSON.stringify(body)
    init.headers['content-type'] ??= 'application/json'
  }

  return new NextRequest(absolute, init) as ExtendedNextRequest
}

/** Wrap route params (e.g. { boardId }) in the context shape handlers receive. */
export function buildContext(params: Params = {}): ExtendedNextContext {
  return { params }
}

type RouteHandler = (req: ExtendedNextRequest, context: ExtendedNextContext) => Promise<NextResponse>

export interface InvokeResult<T = unknown> {
  status: number
  /** Parsed JSON body, or undefined for an empty body (e.g. some DELETEs). */
  body: T
  raw: NextResponse
}

/**
 * Invoke an exported route handler and read back status + parsed JSON.
 *
 * Pass either a pre-built request (via `request`) or the BuildRequestOptions to
 * construct one. Params for dynamic segments go in `params`.
 */
export async function invokeRoute<T = unknown>(
  handler: RouteHandler,
  options: BuildRequestOptions & { params?: Params; request?: ExtendedNextRequest } = {}
): Promise<InvokeResult<T>> {
  const { params, request, ...buildOptions } = options
  const req = request ?? buildRequest(buildOptions)
  const res = await handler(req, buildContext(params))

  let body: T
  try {
    body = (await res.clone().json()) as T
  } catch {
    body = undefined as T
  }

  return { status: res.status, body, raw: res }
}
