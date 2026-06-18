import { describe, expect, it, vi } from 'vitest'

import { createPlannerStore, type PlannerStore } from './store'
import type { PlannerAction, PlannerType } from './types'

/*
 * Store mechanics are reducer-agnostic, so a trivial counter reducer isolates
 * the three behaviours that matter: notify-on-change, the no-op (next === state)
 * guard, and subscribe/unsubscribe. Casts confine the counter shape to the test.
 */
type Counter = { n: number }
const trivialReducer = (state: Counter, action: { type: string }): Counter =>
  action.type === 'inc' ? { n: state.n + 1 } : state

const makeStore = (): PlannerStore =>
  createPlannerStore(
    { n: 0 } as unknown as PlannerType,
    trivialReducer as unknown as (state: PlannerType, action: PlannerAction) => PlannerType
  )

const inc = { type: 'inc' } as unknown as PlannerAction
const noop = { type: 'noop' } as unknown as PlannerAction
const count = (store: PlannerStore): number => (store.getState() as unknown as Counter).n

describe('createPlannerStore', () => {
  it('exposes the initial state via getState', () => {
    expect(count(makeStore())).toBe(0)
  })

  it('updates state and notifies subscribers when the reducer returns a new reference', () => {
    const store = makeStore()
    const listener = vi.fn()
    store.subscribe(listener)

    store.dispatch(inc)

    expect(count(store)).toBe(1)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('does NOT notify when the reducer returns the same reference (no-op guard)', () => {
    const store = makeStore()
    const listener = vi.fn()
    store.subscribe(listener)

    store.dispatch(noop)

    expect(count(store)).toBe(0)
    expect(listener).not.toHaveBeenCalled()
  })

  it('notifies every subscriber', () => {
    const store = makeStore()
    const a = vi.fn()
    const b = vi.fn()
    store.subscribe(a)
    store.subscribe(b)

    store.dispatch(inc)

    expect(a).toHaveBeenCalledTimes(1)
    expect(b).toHaveBeenCalledTimes(1)
  })

  it('stops notifying after unsubscribe', () => {
    const store = makeStore()
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)

    store.dispatch(inc)
    unsubscribe()
    store.dispatch(inc)

    expect(listener).toHaveBeenCalledTimes(1)
    expect(count(store)).toBe(2)
  })
})
