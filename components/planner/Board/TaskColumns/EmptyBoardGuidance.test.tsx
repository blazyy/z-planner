// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { EmptyBoardGuidance } from './EmptyBoardGuidance'

/*
 * onboard-7 regression: the whole-board empty state, shown in the columns area
 * when a board has zero columns. Propless, no context. We pin the headline +
 * the pointer to the toolbar's "Add New Column" affordance (this component is
 * guidance only; it owns no button itself), and the role=note semantics.
 */

afterEach(cleanup)

describe('<EmptyBoardGuidance />', () => {
  it('renders the no-columns headline', () => {
    render(<EmptyBoardGuidance />)
    expect(screen.getByText('This board has no columns yet')).toBeInTheDocument()
  })

  it('points the user at the toolbar Add New Column button', () => {
    render(<EmptyBoardGuidance />)
    expect(screen.getByText(/add a column with the .*add new column.* button in the toolbar/i)).toBeInTheDocument()
  })

  it('renders as a non-intrusive note region', () => {
    render(<EmptyBoardGuidance />)
    expect(screen.getByRole('note')).toBeInTheDocument()
  })
})
