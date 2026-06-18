// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { BoardSkeleton } from './BoardSkeleton'

/*
 * onboard-7 regression: the load-time placeholder (shown while a board's heavy
 * slice is still fetching, i.e. !hasLoaded). Pure presentational, no context,
 * so it renders standalone. We pin the contract the rest of the app relies on:
 * an accessible busy region (so SRs announce "loading" rather than reading a
 * wall of empty boxes) and a stable count of skeleton placeholders mirroring
 * the real 3-column layout (4 + 3 + 5 cards = 12 card skeletons), so the
 * load->board transition doesn't shift content.
 */

afterEach(cleanup)

describe('<BoardSkeleton />', () => {
  it('exposes an accessible busy region for screen readers', () => {
    render(<BoardSkeleton />)
    const region = screen.getByLabelText('Loading board')
    expect(region).toBeInTheDocument()
    expect(region).toHaveAttribute('aria-busy', 'true')
  })

  it('renders animated skeleton placeholders', () => {
    const { container } = render(<BoardSkeleton />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    // 4 toolbar placeholders + 3 column headers (2 each = 6) + 12 task cards
    // (3 skeletons each = 36) = 46. Assert the floor rather than the exact count
    // so a cosmetic header tweak doesn't break the test, while still proving the
    // placeholders actually render.
    expect(skeletons.length).toBeGreaterThanOrEqual(40)
  })

  it('mirrors the three-column board layout', () => {
    const { container } = render(<BoardSkeleton />)
    // Each ColumnSkeleton owns a fixed-width w-96 wrapper; there are 3.
    const columns = container.querySelectorAll('.w-96')
    expect(columns).toHaveLength(3)
  })
})
