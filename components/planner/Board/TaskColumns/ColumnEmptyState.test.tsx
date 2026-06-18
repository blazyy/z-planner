// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { ColumnEmptyState } from './ColumnEmptyState'

/*
 * onboard-7 regression: the in-column empty state. Its sole prop (isFilterActive)
 * flips the copy between "a filter is hiding cards" and "this column is genuinely
 * empty, here's how to add one". Pure, no context. We pin BOTH branches so a copy
 * regression on either path is caught, plus the role=note semantics the layout
 * relies on (additive guidance, not an alert).
 */

afterEach(cleanup)

describe('<ColumnEmptyState />', () => {
  it('shows the filter-aware copy when a filter is active', () => {
    render(<ColumnEmptyState isFilterActive={true} />)
    expect(screen.getByText('No tasks match your filters.')).toBeInTheDocument()
    // The add-a-task hint must NOT show when the column is merely filtered.
    expect(screen.queryByText(/add your first task/i)).not.toBeInTheDocument()
    expect(screen.queryByText('No tasks yet')).not.toBeInTheDocument()
  })

  it('shows the add-a-task hint when no filter is active', () => {
    render(<ColumnEmptyState isFilterActive={false} />)
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
    expect(screen.getByText(/use the \+ in the column header to add your first task/i)).toBeInTheDocument()
    // The filter copy must NOT leak into the genuinely-empty branch.
    expect(screen.queryByText('No tasks match your filters.')).not.toBeInTheDocument()
  })

  it('renders as a non-intrusive note region', () => {
    render(<ColumnEmptyState isFilterActive={false} />)
    expect(screen.getByRole('note')).toBeInTheDocument()
  })
})
