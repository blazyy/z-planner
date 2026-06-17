// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Badge } from './badge'

/*
 * RTL smoke test for the Badge leaf (components/ui/badge.tsx). Chosen over the
 * planner CategoryBadge components because those need usePlanner context + a
 * Radix DropdownMenu portal; Badge is a pure presentational div, so this stays
 * focused and robust. It pins the behavior CategoryBadge relies on: rendering
 * children and forwarding arbitrary props (className, aria-*).
 *
 * jest-dom matchers + cleanup are registered in-file so node-env .test.ts files
 * are unaffected (no global setupFiles). Env is jsdom via the pragma above.
 */

afterEach(cleanup)

describe('<Badge />', () => {
  it('renders its children as text content', () => {
    render(<Badge>Urgent</Badge>)
    expect(screen.getByText('Urgent')).toBeInTheDocument()
  })

  it('applies the default variant classes', () => {
    render(<Badge>Default</Badge>)
    const badge = screen.getByText('Default')
    expect(badge).toHaveClass('bg-primary', 'text-primary-foreground')
    // default variant keeps the hover affordance
    expect(badge.className).toContain('hover:bg-primary/80')
  })

  it('applies the defaultNoHover variant (no hover class)', () => {
    render(<Badge variant='defaultNoHover'>Static</Badge>)
    const badge = screen.getByText('Static')
    expect(badge).toHaveClass('bg-primary', 'text-primary-foreground')
    expect(badge.className).not.toContain('hover:bg-primary/80')
  })

  it('merges a custom className alongside variant classes', () => {
    render(<Badge className='custom-color'>Tagged</Badge>)
    const badge = screen.getByText('Tagged')
    expect(badge).toHaveClass('custom-color')
    expect(badge).toHaveClass('rounded-full')
  })

  it('forwards arbitrary props including aria attributes', () => {
    render(
      <Badge aria-label='category badge' data-testid='badge'>
        Work
      </Badge>
    )
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveAttribute('aria-label', 'category badge')
    expect(badge).toHaveTextContent('Work')
  })
})
