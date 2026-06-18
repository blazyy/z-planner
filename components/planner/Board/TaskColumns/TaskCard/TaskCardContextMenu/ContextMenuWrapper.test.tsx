// @vitest-environment jsdom
import { AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PlannerDispatchContext, PlannerStoreContext } from '@/hooks/Planner/Planner'
import { plannerReducer } from '@/hooks/Planner/plannerReducer'
import { createPlannerStore } from '@/hooks/Planner/store'
import type { PlannerType, TaskCardInfoType } from '@/hooks/Planner/types'
import { emptyPlannerData } from '@/utils/plannerUtils/apiClient'

import { ContextMenuWrapper } from './ContextMenuWrapper'

/*
 * onboard-5: deleting a task card shows a 5s "Undo" toast. These tests pin that
 * deleting captures the card + fires DELETE + shows the undo toast, and that
 * invoking the toast's Undo restores the card (dispatch + same-id POST at the
 * original index). axios + sonner are mocked; the store is real so we can read
 * back the restored card.
 */

vi.mock('axios', () => ({
  default: { post: vi.fn(), patch: vi.fn(), delete: vi.fn().mockResolvedValue({ data: {} }) },
}))

// toast is called as toast('msg', opts); keep .error around for apiClient's use.
// Defined inside the (hoisted) factory, then retrieved below.
vi.mock('sonner', () => ({ toast: Object.assign(vi.fn(), { error: vi.fn() }) }))

const axiosMock = (await import('axios')).default
const toastMock = vi.mocked((await import('sonner')).toast)

// sonner's ExternalToast types `action` as ReactNode | Action; we always pass
// the object form, so narrow it for the assertions.
type ToastAction = { label: string; onClick: (e: React.MouseEvent<HTMLButtonElement>) => void }
const undoAction = (opts: unknown): ToastAction => (opts as { action: ToastAction }).action

const card = (id: string, overrides: Partial<TaskCardInfoType> = {}): TaskCardInfoType => ({
  id,
  title: `Card ${id}`,
  category: 'unassigned',
  content: '',
  status: 'created',
  subTasks: [],
  ...overrides,
})

const seed = (): PlannerType => ({
  ...emptyPlannerData,
  columns: { col1: { id: 'col1', name: 'To Do', taskCards: ['card1', 'card2', 'card3'] } },
  taskCards: { card1: card('card1'), card2: card('card2'), card3: card('card3') },
})

const renderWrapper = (store = createPlannerStore(seed(), plannerReducer)) => {
  render(
    <PlannerStoreContext.Provider value={store}>
      <PlannerDispatchContext.Provider value={store.dispatch}>
        <ContextMenuWrapper boardId='board1' columnId='col1' taskCardId='card2'>
          <AlertDialogTrigger>Open delete dialog</AlertDialogTrigger>
        </ContextMenuWrapper>
      </PlannerDispatchContext.Provider>
    </PlannerStoreContext.Provider>
  )
  return store
}

// Lets the sendMutation FIFO drain: the optimistic dispatch is synchronous, but
// the axios request fires from writeChain.then(...), a microtask later.
const flushMutations = () =>
  act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })

const openAndConfirmDelete = async () => {
  fireEvent.click(screen.getByText('Open delete dialog'))
  act(() => {
    fireEvent.click(screen.getByText('Delete'))
  })
  await flushMutations()
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('ContextMenuWrapper delete + undo', () => {
  it('on confirm: removes the card optimistically, fires DELETE, and shows an undo toast', async () => {
    const store = renderWrapper()

    await openAndConfirmDelete()

    // Optimistic delete applied to the store.
    expect(store.getState().columns.col1.taskCards).toEqual(['card1', 'card3'])
    expect(store.getState().taskCards.card2).toBeUndefined()

    // DELETE fired through the FIFO with the right path.
    expect(vi.mocked(axiosMock.delete)).toHaveBeenCalledWith('/api/planner/columns/col1/cards/card2')

    // Undo toast shown with a 5s duration and an Undo action.
    expect(toastMock).toHaveBeenCalledTimes(1)
    const [message, opts] = toastMock.mock.calls[0]
    const action = undoAction(opts)
    expect(message).toBe('Task deleted')
    expect(opts?.duration).toBe(5000)
    expect(action.label).toBe('Undo')
    expect(typeof action.onClick).toBe('function')
  })

  it('invoking Undo restores the card at its original index and re-creates it with the same id', async () => {
    const store = renderWrapper()

    await openAndConfirmDelete()

    const undo = undoAction(toastMock.mock.calls[0][1]).onClick
    act(() => {
      undo(new MouseEvent('click') as unknown as React.MouseEvent<HTMLButtonElement>)
    })
    await flushMutations()

    // Card restored to its original index (1) in the store.
    expect(store.getState().columns.col1.taskCards).toEqual(['card1', 'card2', 'card3'])
    expect(store.getState().taskCards.card2).toEqual(card('card2'))

    // Re-created server-side with the SAME id + original index ordering.
    expect(vi.mocked(axiosMock.post)).toHaveBeenCalledWith('/api/planner/columns/col1/cards', {
      newTaskCardDetails: card('card2'),
      updatedTaskCards: ['card1', 'card2', 'card3'],
    })
  })
})
