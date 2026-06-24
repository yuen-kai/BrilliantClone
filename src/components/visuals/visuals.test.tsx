import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RoundTable } from './RoundTable'
import { ComplementDots } from './ComplementDots'

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

describe('ComplementDots', () => {
  it('toggles the unwanted set and shows the subtraction', async () => {
    const user = userEvent.setup()
    render(
      <ComplementDots total={8} unwanted={1} wantedLabel="have a head" unwantedLabel="all-tails" />,
    )

    expect(screen.getByText(/8 total/)).toBeTruthy()
    const btn = screen.getByRole('button', { name: /cross out the all-tails/i })
    await user.click(btn)
    expect(screen.getByRole('button', { name: /bring them back/i })).toBeTruthy()
  })
})
