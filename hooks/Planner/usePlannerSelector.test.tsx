// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { emptyPlannerData } from '@/utils/plannerUtils/apiClient'

import { PlannerStoreContext, usePlannerSelector } from './Planner'
import { plannerReducer } from './plannerReducer'
import { createPlannerStore } from './store'
import type { PlannerType } from './types'

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
  taskCards: { a: card('a', 'A'), b: card('b', 'B') },
})

/*
 * Proves the perf-2 win: a component subscribed (via usePlannerSelector) to one
 * card must NOT re-render when a DIFFERENT card mutates, and the subscribed one
 * must re-render with the new value. Exact render counts also prove there is no
 * render loop. immer keeps the untouched card referentially stable, which is
 * what the selector's default equality relies on.
 */
describe('usePlannerSelector', () => {
  it('re-renders only the component whose selected slice changed', () => {
    const store = createPlannerStore(seed(), plannerReducer)
    const renders = { a: 0, b: 0 }

    function CardTitle({ id }: { id: 'a' | 'b' }) {
      renders[id]++
      const c = usePlannerSelector((s) => s.taskCards[id])
      return <span data-testid={id}>{c.title}</span>
    }

    render(
      <PlannerStoreContext.Provider value={store}>
        <CardTitle id='a' />
        <CardTitle id='b' />
      </PlannerStoreContext.Provider>
    )

    expect(renders).toEqual({ a: 1, b: 1 })
    expect(screen.getByTestId('a').textContent).toBe('A')

    act(() => {
      store.dispatch({ type: 'taskCardTitleChanged', payload: { taskCardId: 'a', newTitle: 'A2' } })
    })

    // a re-rendered with the new title; b did NOT re-render (its slice ref is unchanged).
    expect(renders.a).toBe(2)
    expect(renders.b).toBe(1)
    expect(screen.getByTestId('a').textContent).toBe('A2')
    expect(screen.getByTestId('b').textContent).toBe('B')
  })

  it('does not re-render subscribers on a no-op dispatch', () => {
    const store = createPlannerStore(seed(), plannerReducer)
    let count = 0

    function Title() {
      count++
      const c = usePlannerSelector((s) => s.taskCards.a)
      return <span>{c.title}</span>
    }

    render(
      <PlannerStoreContext.Provider value={store}>
        <Title />
      </PlannerStoreContext.Provider>
    )
    expect(count).toBe(1)

    // Same value -> immer returns the same root reference -> store skips notifying.
    act(() => {
      store.dispatch({ type: 'taskCardTitleChanged', payload: { taskCardId: 'a', newTitle: 'A' } })
    })
    expect(count).toBe(1)
  })
})
