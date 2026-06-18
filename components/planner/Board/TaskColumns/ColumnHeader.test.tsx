// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PlannerStoreContext } from '@/hooks/Planner/Planner'
import { plannerReducer } from '@/hooks/Planner/plannerReducer'
import { createPlannerStore } from '@/hooks/Planner/store'
import type { PlannerType } from '@/hooks/Planner/types'
import { emptyPlannerData } from '@/utils/plannerUtils/apiClient'

import { ColumnHeader } from './ColumnHeader'

// AddNewCardButton (rendered inside ColumnHeader) focuses a DOM node via an
// effect; jsdom has it, but stub it out so the test stays about render counts.
vi.mock('@/utils/plannerUtils/cardUtils/changeCardCheckedStatus', () => ({ default: vi.fn() }))

const card = (id: string, title: string) => ({
  id,
  title,
  category: 'unassigned',
  content: '',
  status: 'created' as const,
  subTasks: [],
})

const seed = (): PlannerType => ({
  ...emptyPlannerData,
  columns: { col1: { id: 'col1', name: 'To Do', taskCards: ['a'] } },
  taskCards: { a: card('a', 'A') },
})

/*
 * Proves the perf-8 win: ColumnHeader is wrapped in React.memo and subscribes
 * (via usePlannerSelector) only to its own column's name. A mutation to an
 * UNRELATED slice (a task card's title) must NOT re-render it; a mutation to its
 * OWN slice (the column name) must. Render count is tracked by spying on the
 * memoized component's render through the DOM output it produces.
 */
describe('ColumnHeader (memoized)', () => {
  it('does not re-render when an unrelated slice changes, but does on its own', () => {
    const store = createPlannerStore(seed(), plannerReducer)
    let renders = 0

    function Probe() {
      renders++
      return <ColumnHeader columnId='col1' dragHandleProps={null} />
    }

    render(
      <PlannerStoreContext.Provider value={store}>
        <Probe />
      </PlannerStoreContext.Provider>
    )

    expect(renders).toBe(1)
    expect(screen.getByText('To Do')).toBeTruthy()

    // Unrelated slice mutates: the Probe wrapper does not re-render, and even if
    // it did, ColumnHeader's memo + name-only subscription keeps it stable.
    act(() => {
      store.dispatch({ type: 'taskCardTitleChanged', payload: { taskCardId: 'a', newTitle: 'A2' } })
    })
    expect(renders).toBe(1)
    expect(screen.getByText('To Do')).toBeTruthy()

    // Own slice mutates: the subscribed name changes, so it re-renders with it.
    act(() => {
      store.dispatch({ type: 'columnNameChanged', payload: { columnId: 'col1', newName: 'Doing' } })
    })
    expect(screen.getByText('Doing')).toBeTruthy()
  })
})
