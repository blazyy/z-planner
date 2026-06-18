// @vitest-environment jsdom
import { DragDropContext } from '@hello-pangea/dnd'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { PlannerStore } from '@/hooks/Planner/store'
import type { PlannerType } from '@/hooks/Planner/types'

// changeCardCheckedStatus runs on a Checkbox click effect path; stub so the test
// stays about RENDER STRUCTURE, not card mutation side effects.
vi.mock('@/utils/plannerUtils/cardUtils/changeCardCheckedStatus', () => ({ default: vi.fn() }))

const card = (id: string, title: string) => ({
  id,
  title,
  category: 'unassigned',
  content: '',
  status: 'created' as const,
  subTasks: [],
})

const seed = (taskCardIds: string[]): PlannerType => ({
  boardOrder: [],
  boards: { board1: { id: 'board1', name: 'B', columns: ['col1'], categories: ['unassigned'] } },
  columns: { col1: { id: 'col1', name: 'To Do', taskCards: taskCardIds } },
  categories: { unassigned: { id: 'unassigned', name: 'Unassigned', color: 'gray' } },
  taskCards: Object.fromEntries(taskCardIds.map((id) => [id, card(id, id)])),
  subTasks: {},
})

// dnd needs a DragDropContext ancestor for Droppable/Draggable to mount.
const withProviders = (StoreContext: React.Context<PlannerStore>, store: PlannerStore, children: ReactNode) => (
  <StoreContext.Provider value={store}>
    <DragDropContext onDragEnd={() => {}}>{children}</DragDropContext>
  </StoreContext.Provider>
)

// The flag is a module-level const read from env at import. Each test imports the
// component graph FRESH (after stubbing env) so the const reflects the stub. We
// pull PlannerStoreContext + store from the SAME fresh graph so the provider and
// the consumer share one context identity (a stale top-level import would not).
const loadFreshGraph = async () => {
  const [{ ColumnTasks }, { PlannerStoreContext }, { createPlannerStore }, { plannerReducer }] = await Promise.all([
    import('./ColumnTasks'),
    import('@/hooks/Planner/Planner'),
    import('@/hooks/Planner/store'),
    import('@/hooks/Planner/plannerReducer'),
  ])
  return { ColumnTasks, PlannerStoreContext, createPlannerStore, plannerReducer }
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

/*
 * perf-6/perf-7 SAFE INVARIANT. The virtualization flag is DEFAULT OFF, and the
 * flag-off path must be exactly today's behavior. This guards that promise: with
 * the flag unset (its default), ColumnTasks renders the plain, non-windowed list
 * (every visible card present, no react-window scroll container), so shipping the
 * flag changes nothing for current users.
 */
describe('ColumnTasks virtualization flag (default OFF)', () => {
  it('renders the normal non-windowed list when the flag is off', async () => {
    // No env stub: NEXT_PUBLIC_VIRTUALIZE_COLUMNS is unset -> flag is off.
    const { ColumnTasks, PlannerStoreContext, createPlannerStore, plannerReducer } = await loadFreshGraph()
    const store = createPlannerStore(seed(['Alpha', 'Beta', 'Gamma']), plannerReducer)
    const { container } = render(
      withProviders(PlannerStoreContext, store, <ColumnTasks boardId='board1' columnId='col1' />)
    )

    // All three cards render (non-windowed path mounts every visible card).
    expect(screen.getByText('Alpha')).toBeTruthy()
    expect(screen.getByText('Beta')).toBeTruthy()
    expect(screen.getByText('Gamma')).toBeTruthy()

    // react-window stamps its scroll container with this inline style; its
    // absence proves the windowed renderer did NOT run.
    const windowed = container.querySelector('[style*="overflow: auto"]')
    expect(windowed).toBeNull()
  })

  it('still shows the empty-state on the flag-off path when there are no cards', async () => {
    const { ColumnTasks, PlannerStoreContext, createPlannerStore, plannerReducer } = await loadFreshGraph()
    const store = createPlannerStore(seed([]), plannerReducer)
    render(withProviders(PlannerStoreContext, store, <ColumnTasks boardId='board1' columnId='col1' />))

    expect(screen.getByText('No tasks yet')).toBeTruthy()
  })

  it('renders without crashing on the flag-ON path (windowed list mounts)', async () => {
    // Flip the build-time flag for THIS import only. resetModules (afterEach)
    // guarantees the module re-evaluates the const so the stub takes effect.
    vi.stubEnv('NEXT_PUBLIC_VIRTUALIZE_COLUMNS', 'true')
    const { ColumnTasks, PlannerStoreContext, createPlannerStore, plannerReducer } = await loadFreshGraph()
    const store = createPlannerStore(seed(['Alpha', 'Beta', 'Gamma']), plannerReducer)
    const { container } = render(
      withProviders(PlannerStoreContext, store, <ColumnTasks boardId='board1' columnId='col1' />)
    )

    // react-window mounts its overflow scroll container on the flag-ON path.
    const windowed = container.querySelector('[style*="overflow: auto"]')
    expect(windowed).not.toBeNull()
  })
})
