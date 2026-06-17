import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/*
 * Pins flushDebouncedMutation (the bug-1 fix): a pending trailing-edge debounced
 * save must be forceable to fire NOW, so a card edit isn't lost when the dialog
 * closes before the timer elapses. Mirrors the sibling apiClient tests: mock
 * axios + sonner, fake timers, reset module state per test.
 */

vi.mock('axios', () => ({
  default: { get: vi.fn() },
}))
vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

const loadApiClient = async () => {
  vi.resetModules()
  return await import('./apiClient')
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

describe('flushDebouncedMutation', () => {
  it('fires the pending mutation immediately, before the debounce window elapses', async () => {
    const { sendDebouncedMutation, flushDebouncedMutation } = await loadApiClient()
    const dispatch = vi.fn()
    const sent: string[] = []

    sendDebouncedMutation('card-title:a', dispatch, async () => {
      sent.push('a')
    })
    // Timer has NOT fired yet; without flush, nothing has been sent.
    expect(sent).toEqual([])

    flushDebouncedMutation('card-title:a')
    // sendMutation runs the request on the microtask queue; drain it without
    // advancing fake timers, proving flush did not wait out the window.
    await Promise.resolve()
    await Promise.resolve()
    expect(sent).toEqual(['a'])
  })

  it('sends the LATEST value when multiple edits coalesced before flush', async () => {
    const { sendDebouncedMutation, flushDebouncedMutation } = await loadApiClient()
    const { DEBOUNCE_TIME_MS } = await import('@/constants/constants')
    const dispatch = vi.fn()
    const sent: string[] = []

    sendDebouncedMutation('card-title:a', dispatch, async () => {
      sent.push('first')
    })
    vi.advanceTimersByTime(DEBOUNCE_TIME_MS - 50)
    sendDebouncedMutation('card-title:a', dispatch, async () => {
      sent.push('second')
    })

    flushDebouncedMutation('card-title:a')
    await Promise.resolve()
    await Promise.resolve()
    expect(sent).toEqual(['second'])
  })

  it('does not double-fire: after flush, the original timer is a no-op', async () => {
    const { sendDebouncedMutation, flushDebouncedMutation } = await loadApiClient()
    const dispatch = vi.fn()
    const sent: string[] = []

    sendDebouncedMutation('card-title:a', dispatch, async () => {
      sent.push('a')
    })
    flushDebouncedMutation('card-title:a')
    // Let any leftover timer elapse; the request must still have run exactly once.
    await vi.runAllTimersAsync()
    expect(sent).toEqual(['a'])
  })

  it('is a no-op when the key has nothing pending', async () => {
    const { flushDebouncedMutation } = await loadApiClient()
    const axios = (await import('axios')).default

    // Never throws, never touches the network.
    expect(() => flushDebouncedMutation('card-title:never-edited')).not.toThrow()
    await vi.runAllTimersAsync()
    expect(vi.mocked(axios.get)).not.toHaveBeenCalled()
  })

  it('is a no-op when called twice (key already drained by the first flush)', async () => {
    const { sendDebouncedMutation, flushDebouncedMutation } = await loadApiClient()
    const dispatch = vi.fn()
    const sent: string[] = []

    sendDebouncedMutation('card-content:a', dispatch, async () => {
      sent.push('a')
    })
    flushDebouncedMutation('card-content:a')
    flushDebouncedMutation('card-content:a')
    await vi.runAllTimersAsync()
    expect(sent).toEqual(['a'])
  })

  it('flushing key A leaves an unrelated pending key B untouched', async () => {
    const { sendDebouncedMutation, flushDebouncedMutation } = await loadApiClient()
    const { DEBOUNCE_TIME_MS } = await import('@/constants/constants')
    const dispatch = vi.fn()
    const sent: string[] = []

    sendDebouncedMutation('card-title:a', dispatch, async () => {
      sent.push('a')
    })
    sendDebouncedMutation('card-content:a', dispatch, async () => {
      sent.push('b')
    })

    flushDebouncedMutation('card-title:a')
    await Promise.resolve()
    await Promise.resolve()
    // Only A drained; B is still waiting on its timer.
    expect(sent).toEqual(['a'])

    vi.advanceTimersByTime(DEBOUNCE_TIME_MS)
    await vi.runAllTimersAsync()
    expect(sent.sort()).toEqual(['a', 'b'])
  })
})
