// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Dialog } from '@/components/ui/dialog'
import { PlannerStoreContext } from '@/hooks/Planner/Planner'
import { plannerReducer } from '@/hooks/Planner/plannerReducer'
import { createPlannerStore } from '@/hooks/Planner/store'
import type { PlannerType } from '@/hooks/Planner/types'
import { emptyPlannerData } from '@/utils/plannerUtils/apiClient'

// Spy on the flush so we can assert the close hook fires. The real module also
// owns sendDebouncedMutation etc.; keep them intact, just observe flush.
const flushSpy = vi.fn()
vi.mock('@/utils/plannerUtils/apiClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/plannerUtils/apiClient')>()
  return { ...actual, flushDebouncedMutation: (key: string) => flushSpy(key) }
})

// EditableSubTasks pulls in dnd Droppable/Draggable (needs a DragDropContext) and
// a body portal; none of that is relevant to the flush-on-close contract, so
// stub it to keep the test about the cleanup effect only.
vi.mock('./EditableSubTasks/EditableSubTasks', () => ({
  EditableSubTasks: () => <div data-testid='editable-subtasks' />,
}))

import { TaskCardDialog } from './TaskCardDialog'

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
  boards: { board1: { id: 'board1', name: 'B', columns: ['col1'], categories: ['unassigned'] } },
  columns: { col1: { id: 'col1', name: 'To Do', taskCards: ['a'] } },
  categories: { unassigned: { id: 'unassigned', name: 'Unassigned', color: 'gray' } },
  taskCards: { a: card('a', 'A') },
})

afterEach(() => {
  flushSpy.mockClear()
})

/*
 * Guards the perf-5 lazy-load: code-splitting TaskCardDialog only mounts it
 * while open, so closing (unmount) must still run its cleanup effect that
 * flushes the per-card debounced title/content PATCHes. This proves the
 * flush-on-close contract that the lazy mount must preserve: unmounting the
 * dialog flushes both card-title and card-content keys for that card.
 */
describe('TaskCardDialog flush-on-close', () => {
  it('flushes both debounced keys when the dialog unmounts (closes)', () => {
    const store = createPlannerStore(seed(), plannerReducer)
    const { unmount } = render(
      <PlannerStoreContext.Provider value={store}>
        <Dialog open>
          <TaskCardDialog boardId='board1' columnId='col1' id='a' />
        </Dialog>
      </PlannerStoreContext.Provider>
    )

    expect(flushSpy).not.toHaveBeenCalled()

    // Unmount == dialog close (the lazy mount unmounts the content on close).
    unmount()

    expect(flushSpy).toHaveBeenCalledWith('card-title:a')
    expect(flushSpy).toHaveBeenCalledWith('card-content:a')
  })
})
