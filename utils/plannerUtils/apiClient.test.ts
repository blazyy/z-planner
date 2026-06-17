import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('axios', () => ({
  default: { get: vi.fn() },
}))
vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

// apiClient keeps module-level queue state, so each test gets a fresh copy.
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

describe('sendMutation', () => {
  it('runs requests strictly in submission order', async () => {
    const { sendMutation } = await loadApiClient()
    const order: number[] = []
    const dispatch = vi.fn()

    let releaseFirst: () => void
    const firstGate = new Promise<void>((resolve) => {
      releaseFirst = resolve
    })

    sendMutation(dispatch, async () => {
      await firstGate
      order.push(1)
    })
    sendMutation(dispatch, async () => {
      order.push(2)
    })

    // The second request must wait for the first even though it resolves instantly.
    expect(order).toEqual([])
    releaseFirst!()
    await vi.runAllTimersAsync()
    expect(order).toEqual([1, 2])
  })

  it('on failure: error toast fires and the store re-hydrates from the server', async () => {
    const { sendMutation } = await loadApiClient()
    const axios = (await import('axios')).default
    const { toast } = await import('sonner')
    const dispatch = vi.fn()

    vi.mocked(axios.get).mockResolvedValue({
      data: { boardOrder: [], boards: {}, columns: {}, categories: {}, taskCards: {}, subTasks: {} },
    })

    sendMutation(dispatch, () => Promise.reject(new Error('boom')))
    await vi.runAllTimersAsync()

    expect(toast.error).toHaveBeenCalledOnce()
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'dataFetchedFromDatabase',
        payload: expect.objectContaining({ boardOrder: [], boards: {}, columns: {} }),
      })
    )
  })

  it('a failed request does not block later requests', async () => {
    const { sendMutation } = await loadApiClient()
    const axios = (await import('axios')).default
    vi.mocked(axios.get).mockResolvedValue({
      data: { boardOrder: [], boards: {}, columns: {}, categories: {}, taskCards: {}, subTasks: {} },
    })
    const dispatch = vi.fn()
    const ran: string[] = []

    sendMutation(dispatch, () => Promise.reject(new Error('boom')))
    sendMutation(dispatch, async () => {
      ran.push('after-failure')
    })
    await vi.runAllTimersAsync()

    expect(ran).toEqual(['after-failure'])
  })
})

describe('sendDebouncedMutation', () => {
  it('coalesces rapid calls for the same entity into the latest request', async () => {
    const { sendDebouncedMutation } = await loadApiClient()
    const dispatch = vi.fn()
    const sent: string[] = []

    sendDebouncedMutation('card-title:a', dispatch, async () => {
      sent.push('a:first')
    })
    sendDebouncedMutation('card-title:a', dispatch, async () => {
      sent.push('a:second')
    })
    await vi.runAllTimersAsync()

    expect(sent).toEqual(['a:second'])
  })

  it('different entities never cancel each other (the bug this replaces)', async () => {
    const { sendDebouncedMutation } = await loadApiClient()
    const dispatch = vi.fn()
    const sent: string[] = []

    // Edit card A's title, then click into card B within the debounce window:
    // the old shared debounce silently dropped A's save.
    sendDebouncedMutation('card-title:a', dispatch, async () => {
      sent.push('a')
    })
    sendDebouncedMutation('card-title:b', dispatch, async () => {
      sent.push('b')
    })
    await vi.runAllTimersAsync()

    expect(sent.sort()).toEqual(['a', 'b'])
  })
})
