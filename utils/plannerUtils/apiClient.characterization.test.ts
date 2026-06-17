import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/*
 * Extends apiClient.test.ts. The sibling file pins basic FIFO order, single
 * failure -> toast+rehydrate, failure-not-blocking, and debounce coalescing /
 * per-key isolation. This file deepens the guards that the Phase-2 work must
 * not regress:
 *   - FIFO holds even when a later request would naturally resolve FIRST.
 *   - The refetchScheduled guard collapses MANY queued failures into exactly one
 *     error toast and one rehydrate dispatch.
 *   - Debounce per-key isolation with real timing (A then B inside the window).
 */

vi.mock('axios', () => ({
  default: { get: vi.fn() },
}))
vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

// apiClient holds module-level queue state; reset modules per test for isolation.
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

describe('sendMutation — FIFO when a later request is faster', () => {
  it('resolves in dispatch order even though the second request finishes first', async () => {
    const { sendMutation } = await loadApiClient()
    const dispatch = vi.fn()
    const order: number[] = []

    // First request is slow (resolves after a 50ms timer); second is instant.
    // Without the FIFO chain, #2 would land before #1.
    sendMutation(
      dispatch,
      () =>
        new Promise<void>((resolve) =>
          setTimeout(() => {
            order.push(1)
            resolve()
          }, 50)
        )
    )
    sendMutation(dispatch, async () => {
      order.push(2)
    })

    await vi.runAllTimersAsync()
    expect(order).toEqual([1, 2])
  })
})

describe('sendMutation — refetchScheduled guard collapses multiple failures', () => {
  it('three queued failing requests produce exactly ONE toast and ONE rehydrate dispatch', async () => {
    const { sendMutation } = await loadApiClient()
    const axios = (await import('axios')).default
    const { toast } = await import('sonner')
    const dispatch = vi.fn()

    vi.mocked(axios.get).mockResolvedValue({
      data: { boardOrder: [], boards: {}, columns: {}, categories: {}, taskCards: {}, subTasks: {} },
    })

    sendMutation(dispatch, () => Promise.reject(new Error('boom-1')))
    sendMutation(dispatch, () => Promise.reject(new Error('boom-2')))
    sendMutation(dispatch, () => Promise.reject(new Error('boom-3')))

    await vi.runAllTimersAsync()

    expect(toast.error).toHaveBeenCalledTimes(1)
    const rehydrateCalls = dispatch.mock.calls.filter(([action]) => action.type === 'dataFetchedFromDatabase')
    expect(rehydrateCalls).toHaveLength(1)
    // The single refetch hit the server exactly once.
    expect(vi.mocked(axios.get)).toHaveBeenCalledTimes(1)
  })

  it('after a refetch resolves, a later failure schedules a fresh refetch (guard resets)', async () => {
    const { sendMutation } = await loadApiClient()
    const axios = (await import('axios')).default
    const { toast } = await import('sonner')
    const dispatch = vi.fn()

    vi.mocked(axios.get).mockResolvedValue({
      data: { boardOrder: [], boards: {}, columns: {}, categories: {}, taskCards: {}, subTasks: {} },
    })

    sendMutation(dispatch, () => Promise.reject(new Error('boom-1')))
    await vi.runAllTimersAsync()
    expect(toast.error).toHaveBeenCalledTimes(1)

    // Guard has reset; a brand-new failure triggers another toast + refetch.
    sendMutation(dispatch, () => Promise.reject(new Error('boom-2')))
    await vi.runAllTimersAsync()
    expect(toast.error).toHaveBeenCalledTimes(2)
    expect(vi.mocked(axios.get)).toHaveBeenCalledTimes(2)
  })

  it('surfaces a second toast when the rehydrate fetch itself fails', async () => {
    const { sendMutation } = await loadApiClient()
    const axios = (await import('axios')).default
    const { toast } = await import('sonner')
    const dispatch = vi.fn()

    // The rehydrate fetch rejects -> the catch fires the "Could not reach the
    // server" toast and never dispatches dataFetchedFromDatabase.
    vi.mocked(axios.get).mockRejectedValue(new Error('offline'))

    sendMutation(dispatch, () => Promise.reject(new Error('boom')))
    await vi.runAllTimersAsync()

    expect(toast.error).toHaveBeenCalledTimes(2)
    const rehydrateCalls = dispatch.mock.calls.filter(([action]) => action.type === 'dataFetchedFromDatabase')
    expect(rehydrateCalls).toHaveLength(0)
  })
})

describe('sendDebouncedMutation — per-key isolation with timing', () => {
  it('key A then key B inside DEBOUNCE_TIME_MS: A is NOT cancelled, both eventually send', async () => {
    const { DEBOUNCE_TIME_MS } = await import('@/constants/constants')
    const { sendDebouncedMutation } = await loadApiClient()
    const dispatch = vi.fn()
    const sent: string[] = []

    sendDebouncedMutation('A', dispatch, async () => {
      sent.push('A')
    })
    // Advance partway through A's window, then schedule B.
    vi.advanceTimersByTime(DEBOUNCE_TIME_MS - 100)
    sendDebouncedMutation('B', dispatch, async () => {
      sent.push('B')
    })

    await vi.runAllTimersAsync()
    expect(sent.sort()).toEqual(['A', 'B'])
  })

  it('repeated calls to the same key within the window send only the latest', async () => {
    const { DEBOUNCE_TIME_MS } = await import('@/constants/constants')
    const { sendDebouncedMutation } = await loadApiClient()
    const dispatch = vi.fn()
    const sent: string[] = []

    sendDebouncedMutation('A', dispatch, async () => {
      sent.push('first')
    })
    vi.advanceTimersByTime(DEBOUNCE_TIME_MS - 50)
    sendDebouncedMutation('A', dispatch, async () => {
      sent.push('second')
    })
    await vi.runAllTimersAsync()

    expect(sent).toEqual(['second'])
  })
})
