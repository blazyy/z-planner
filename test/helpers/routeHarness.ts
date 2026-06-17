/*
 * Single entry point for App Router route-handler tests.
 *
 * IMPORTANT — import this module (or any of ./clerkMock, ./db) BEFORE importing
 * the route under test. The vi.mock calls for '@clerk/nextjs/server' and
 * '@/lib/dbConnect' live in those modules; vitest hoists vi.mock to the top of
 * the importing test file, but the route's own imports must still resolve to
 * the mocked versions, which they do because the mock registration happens at
 * module-eval time here.
 *
 * Typical usage in a test file:
 *
 *   import { startMemoryMongo, stopMemoryMongo, resetDb,
 *            setAuthUser, clearAuthUser,
 *            invokeRoute, seedPlanner, getPlanner } from '@/test/helpers/routeHarness'
 *   import { GET } from '@/app/api/planner/route'   // after the harness import
 *
 *   beforeAll(startMemoryMongo)
 *   afterAll(stopMemoryMongo)
 *   beforeEach(resetDb)
 *
 *   it('401s when unauthenticated', async () => {
 *     clearAuthUser()
 *     const { status } = await invokeRoute(GET)
 *     expect(status).toBe(401)
 *   })
 */
export { setAuthUser, clearAuthUser } from './clerkMock'
export { startMemoryMongo, stopMemoryMongo, resetDb } from './db'
export { buildRequest, buildContext, invokeRoute } from './request'
export type { InvokeResult } from './request'
export { seedPlanner, getPlanner, Planner } from './seed'
