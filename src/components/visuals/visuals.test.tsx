import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RoundTable } from './RoundTable'
import { ComplementTree } from './ComplementTree'

describe('RoundTable', () => {
  const seats = [
    { id: 'a', label: 'Ana', emoji: '👧' },
    { id: 'b', label: 'Bo', emoji: '👦' },
    { id: 'c', label: 'Cy', emoji: '🧒' },
    { id: 'd', label: 'Di', emoji: '👩' },
  ]

  it('advances the rotation counter when rotated', async () => {
    const user = userEvent.setup()
    render(<RoundTable seats={seats} />)

    expect(screen.getByText('Rotation 0 of 4')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /rotate one seat/i }))
    expect(screen.getByText('Rotation 1 of 4')).toBeTruthy()
  })

  it('reports a full loop as identical after n rotations', async () => {
    const user = userEvent.setup()
    render(<RoundTable seats={seats} />)
    const btn = screen.getByRole('button', { name: /rotate one seat/i })
    for (let i = 0; i < seats.length; i++) await user.click(btn)
    expect(screen.getByText(/all 4 rotations look the same/i)).toBeTruthy()
  })
})

describe('ComplementTree', () => {
  const config = {
    rootLabel: '8 sequences',
    branches: [
      { id: 'h0', label: '0 heads', count: 1, wanted: false },
      { id: 'h1', label: '1 head', count: 3, wanted: true },
      { id: 'h2', label: '2 heads', count: 3, wanted: true },
      { id: 'h3', label: '3 heads', count: 1, wanted: true },
    ],
  }

  it('toggles strategy without revealing the summed answer', async () => {
    const user = userEvent.setup()
    render(<ComplementTree config={config} />)

    // Shows the per-branch structure but never prints the final sum (7).
    expect(screen.getByText('0 heads')).toBeTruthy()
    expect(screen.queryByText(/=\s*7/)).toBeNull()
    expect(screen.queryByText(/\b7\b/)).toBeNull()

    await user.click(screen.getByRole('button', { name: /use the complement/i }))
    await user.click(screen.getByRole('button', { name: /count directly/i }))
  })
})
