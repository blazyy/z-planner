import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

/*
 * IMPORT ORDER MATTERS — harness first (registers the clerk + dbConnect mocks)
 * before the routes, which transitively pull in server-only clerk.
 */
import {
  clearAuthUser,
  getPlanner,
  invokeRoute,
  resetDb,
  seedPlanner,
  setAuthUser,
  startMemoryMongo,
  stopMemoryMongo,
} from '@/test/helpers/routeHarness'

import { __resetRateLimit } from '@/lib/middleware'
import { POST as columnCreate } from './boards/[boardId]/columns/route'
import { PATCH as columnPatch } from './columns/[columnId]/route'
import { PATCH as cardMove } from './cards/[cardId]/move/route'

/*
 * TENANCY INVARIANT through the real wrapped chain — COMPLEMENTARY to
 * tenancy.harness.test.ts.
 *
 * That suite covers board/column/card/category/subtask DELETE + board/card
 * PATCH. To avoid duplicating it verbatim while still pinning the invariant on
 * the OTHER mutating shapes, this targets the create / reorder / move routes it
 * doesn't touch:
 *   - POST  /api/planner/boards/[boardId]/columns        (create into a board)
 *   - PATCH /api/planner/columns/[columnId]              (rename a column)
 *   - PATCH /api/planner/cards/[cardId]/move             (move across columns)
 *
 * The invariant in every case: a request authed as tenant B, against tenant A's
 * ids, never touches A's data. Each route's updateOne filters on
 * { clerkUserId: B, <A's entity>.id }, which can't match, so matchedCount is 0
 * and the route 404s. A's stored document is asserted byte-for-byte unchanged.
 *
 * B is seeded with its own board/columns so B authenticates against a REAL doc
 * (a 404 from "B has no planner at all" would be a weaker, accidental pass).
 */

// Pad a label into a valid 17-char [0-9a-z] entity id (matches entityId regex).
function id(label: string): string {
  const cleaned = label.toLowerCase().replace(/[^0-9a-z]/g, '')
  return (cleaned + '0'.repeat(17)).slice(0, 17)
}

const A_USER = 'user_tenant_a'
const B_USER = 'user_tenant_b'

const aBoard = id('aboard')
const aColA = id('acolumna')
const aColB = id('acolumnb')
const aCard = id('acard')

const bBoard = id('bboard')
const bColumn = id('bcolumn')

/** Seed tenant A: one board, two columns, a card living in column A. */
async function seedTenantA() {
  await seedPlanner({
    clerkUserId: A_USER,
    boardOrder: [aBoard],
    boards: { [aBoard]: { id: aBoard, name: 'A Board', columns: [aColA, aColB], categories: ['unassigned'] } },
    columns: {
      [aColA]: { id: aColA, name: 'A Col A', taskCards: [aCard] },
      [aColB]: { id: aColB, name: 'A Col B', taskCards: [] },
    },
    categories: { unassigned: { id: 'unassigned', name: 'Unassigned', color: 'slate' } },
    taskCards: {
      [aCard]: { id: aCard, title: 'A Card', category: 'unassigned', content: '', status: 'created', subTasks: [] },
    },
  })
}

/** Seed tenant B with its own board + column so B authenticates against real data. */
async function seedTenantB() {
  await seedPlanner({
    clerkUserId: B_USER,
    boardOrder: [bBoard],
    boards: { [bBoard]: { id: bBoard, name: 'B Board', columns: [bColumn], categories: ['unassigned'] } },
    columns: { [bColumn]: { id: bColumn, name: 'B Col', taskCards: [] } },
    categories: { unassigned: { id: 'unassigned', name: 'Unassigned', color: 'slate' } },
  })
}

beforeAll(startMemoryMongo)
afterAll(stopMemoryMongo)
beforeEach(async () => {
  __resetRateLimit()
  await resetDb()
})
afterEach(clearAuthUser)

describe('tenancy invariant on create/rename/move routes (complementary)', () => {
  it('B creating a column into A board -> 404, A document unchanged', async () => {
    await seedTenantA()
    await seedTenantB()
    const before = await getPlanner(A_USER)

    setAuthUser(B_USER)
    const newColumnId = id('hijackcol')
    const { status } = await invokeRoute<{ error: string }>(columnCreate, {
      method: 'POST',
      params: { boardId: aBoard },
      body: {
        newColumnDetails: { id: newColumnId, name: 'pwned', taskCards: [] },
        updatedColumns: [aColA, aColB, newColumnId],
      },
    })

    expect(status).toBe(404)
    const after = await getPlanner(A_USER)
    expect(after?.boards).toEqual(before?.boards)
    expect(after?.columns).toEqual(before?.columns)
    // The injected column never landed in A's doc.
    expect(after?.columns?.[newColumnId]).toBeUndefined()
  })

  it('B renaming A column -> 404, A columns unchanged', async () => {
    await seedTenantA()
    await seedTenantB()
    const before = await getPlanner(A_USER)

    setAuthUser(B_USER)
    const { status } = await invokeRoute<{ error: string }>(columnPatch, {
      method: 'PATCH',
      params: { columnId: aColA },
      body: { newName: 'hijacked' },
    })

    expect(status).toBe(404)
    const after = await getPlanner(A_USER)
    expect(after?.columns).toEqual(before?.columns)
    expect(after?.columns?.[aColA]?.name).toBe('A Col A')
  })

  it('B moving A card across A columns -> 404, A columns unchanged', async () => {
    await seedTenantA()
    await seedTenantB()
    const before = await getPlanner(A_USER)

    setAuthUser(B_USER)
    const { status } = await invokeRoute<{ error: string }>(cardMove, {
      method: 'PATCH',
      params: { cardId: aCard },
      body: {
        sourceColumnId: aColA,
        destColumnId: aColB,
        sourceColumnTaskCardIds: [],
        destColumnTaskCardIds: [aCard],
      },
    })

    expect(status).toBe(404)
    const after = await getPlanner(A_USER)
    expect(after?.columns).toEqual(before?.columns)
    // The card stayed in its original column for A.
    expect(after?.columns?.[aColA]?.taskCards).toEqual([aCard])
    expect(after?.columns?.[aColB]?.taskCards).toEqual([])
  })

  it('the same column-rename, run by the OWNER, succeeds (negative control)', async () => {
    // Proves the 404s above are tenancy-driven, not a broken payload: A renaming
    // A's own column through the same wrapped handler works.
    await seedTenantA()

    setAuthUser(A_USER)
    const { status } = await invokeRoute(columnPatch, {
      method: 'PATCH',
      params: { columnId: aColA },
      body: { newName: 'A renamed' },
    })

    expect(status).toBe(200)
    const after = await getPlanner(A_USER)
    expect(after?.columns?.[aColA]?.name).toBe('A renamed')
  })
})
