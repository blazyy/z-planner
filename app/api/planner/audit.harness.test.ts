import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearAuthUser,
  invokeRoute,
  resetDb,
  seedPlanner,
  setAuthUser,
  startMemoryMongo,
  stopMemoryMongo,
} from '@/test/helpers/routeHarness'

// Harness import (clerk + dbConnect mocks) must precede the route imports below.
import { GET } from './route'
import { POST } from './boards/route'
import { logger } from '@/lib/logger'

/*
 * End-to-end check that withAudit fires through the real withMiddleware chain:
 * a mutation (POST) emits one structured audit line; a read (GET) emits none.
 * The pino logger is level-'silent' under VITEST, but spying on logger.info
 * replaces the method outright so call capture is independent of the level.
 */

// A valid boardCreate payload (17-char lowercase-alnum ids per entityId schema).
const id17 = (seed: string): string => (seed + 'a'.repeat(17)).slice(0, 17)
const validBoardBody = () => ({
  boardId: id17('board1'),
  boardName: 'Audited Board',
  unassignedCategoryDetails: { id: 'unassigned', name: 'Unassigned', color: '#ccc' },
})

beforeAll(startMemoryMongo)
afterAll(stopMemoryMongo)
beforeEach(resetDb)
afterEach(() => {
  clearAuthUser()
  vi.restoreAllMocks()
})

describe('mutation audit logging (harness)', () => {
  it('emits one audit line with { userId, method, path, status } for a POST', async () => {
    await seedPlanner({ clerkUserId: 'user_audit_post' })
    const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => undefined as never)
    setAuthUser('user_audit_post')

    const { status } = await invokeRoute(POST, {
      method: 'POST',
      url: '/api/planner/boards',
      body: validBoardBody(),
    })
    expect(status).toBe(201)

    const auditCalls = infoSpy.mock.calls.filter(([, msg]) => msg === 'api mutation')
    expect(auditCalls).toHaveLength(1)
    expect(auditCalls[0][0]).toEqual({
      userId: 'user_audit_post',
      method: 'POST',
      path: '/api/planner/boards',
      status: 201,
    })
  })

  it('does NOT emit an audit line for a GET (reads are not audited)', async () => {
    const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => undefined as never)
    setAuthUser('user_audit_get')

    const { status } = await invokeRoute(GET)
    expect(status).toBe(200)

    const auditCalls = infoSpy.mock.calls.filter(([, msg]) => msg === 'api mutation')
    expect(auditCalls).toHaveLength(0)
  })
})
