// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { afterEach, describe, expect, it } from 'vitest'

/*
 * Automated a11y floor (test-a11y): renders a representative set of UI in jsdom
 * and asserts axe finds no violations. axe does NOT check color contrast in
 * jsdom (no layout/computed styles), so this locks the structural/semantic rules
 * only - missing roles/labels, prohibited ARIA, name-from-content, etc. Contrast
 * is covered separately by the badge palette comment in TaskCard/utils.ts.
 *
 * One real violation was found + fixed while writing this: BoardSkeleton carried
 * aria-label on a bare div with no role (aria-prohibited-attr); fixed by adding
 * role="status", which is also the correct semantics for a busy/loading region.
 *
 * jest-axe's matcher + jest-dom matchers are registered in-file (no global
 * setupFiles), env is jsdom via the pragma.
 */
import { Badge } from '@/components/ui/badge'
import { ModeToggle } from '@/components/global/ModeToggle'
import { BoardSkeleton } from '@/components/planner/Board/BoardSkeleton'
import { CategoryBadge } from '@/components/planner/Board/TaskColumns/TaskCard/CategoryBadge'
import { ColumnEmptyState } from '@/components/planner/Board/TaskColumns/ColumnEmptyState'
import { EmptyBoardGuidance } from '@/components/planner/Board/TaskColumns/EmptyBoardGuidance'
import { ManageItemAlertDialog } from '@/components/planner/Settings/ManageItemAlertDialog'
import { PlannerDispatchContext, PlannerStoreContext } from '@/hooks/Planner/Planner'
import { plannerReducer } from '@/hooks/Planner/plannerReducer'
import { createPlannerStore } from '@/hooks/Planner/store'
import type { PlannerType } from '@/hooks/Planner/types'
import { emptyPlannerData } from '@/utils/plannerUtils/apiClient'

expect.extend(toHaveNoViolations)

afterEach(cleanup)

// Minimal planner seed for CategoryBadge: one board with one category and one
// card assigned to it. CategoryBadge reads taskCards[id].category,
// boards[id].categories and the categories map; nothing else.
const BOARD_ID = 'board-1'
const CARD_ID = 'card-1'
const CAT_ID = 'cat-1'

const categoryBadgeSeed = (): PlannerType => ({
  ...emptyPlannerData,
  boards: {
    [BOARD_ID]: { id: BOARD_ID, name: 'Board', columns: [], categories: [CAT_ID] },
  },
  categories: {
    [CAT_ID]: { id: CAT_ID, name: 'Work', color: 'blue' },
  },
  taskCards: {
    [CARD_ID]: {
      id: CARD_ID,
      title: 'A task',
      category: CAT_ID,
      content: '',
      status: 'created',
      subTasks: [],
    },
  },
})

const renderWithPlanner = (ui: React.ReactElement) => {
  const store = createPlannerStore(categoryBadgeSeed(), plannerReducer)
  return render(
    <PlannerStoreContext.Provider value={store}>
      <PlannerDispatchContext.Provider value={store.dispatch}>{ui}</PlannerDispatchContext.Provider>
    </PlannerStoreContext.Provider>
  )
}

describe('a11y floor: no-context components', () => {
  it('Badge', async () => {
    const { container } = render(<Badge>Work</Badge>)
    expect(await axe(container)).toHaveNoViolations()
  })
  it('ModeToggle', async () => {
    const { container } = render(<ModeToggle />)
    expect(await axe(container)).toHaveNoViolations()
  })
  it('BoardSkeleton', async () => {
    const { container } = render(<BoardSkeleton />)
    expect(await axe(container)).toHaveNoViolations()
  })
  it('ColumnEmptyState filtered', async () => {
    const { container } = render(<ColumnEmptyState isFilterActive={true} />)
    expect(await axe(container)).toHaveNoViolations()
  })
  it('ColumnEmptyState empty', async () => {
    const { container } = render(<ColumnEmptyState isFilterActive={false} />)
    expect(await axe(container)).toHaveNoViolations()
  })
  it('EmptyBoardGuidance', async () => {
    const { container } = render(<EmptyBoardGuidance />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('a11y floor: context components', () => {
  it('CategoryBadge (dropdown trigger, closed)', async () => {
    // Default-closed dropdown: only the trigger + Badge render (Radix keeps the
    // menu content unmounted until opened). This locks the resting a11y state of
    // the badge as it appears on every task card.
    const { container } = renderWithPlanner(<CategoryBadge boardId={BOARD_ID} taskCardId={CARD_ID} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('delete-confirm AlertDialog content (open)', async () => {
    render(
      <ManageItemAlertDialog
        onCloseParentDialog={() => {}}
        onClickDelete={() => {}}
        isDeleteButtonDisabled={false}
        deleteButtonDisabledTooltipContent='Cannot delete'
      />
    )
    // Open the dialog so its content (title/description/cancel/confirm) actually
    // mounts. Radix portals it to document.body, so axe must scan the body, not
    // the render container.
    fireEvent.click(screen.getByText('Delete'))
    const dialog = await screen.findByRole('alertdialog')
    expect(dialog).toBeInTheDocument()
    expect(await axe(document.body)).toHaveNoViolations()
  })
})
