import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SlotSelectStepView } from './SlotSelectStep'
import type { SlotSelectStep } from '../../types/lesson'

const permStep: SlotSelectStep = {
  id: 'podium',
  step: 1,
  type: 'slot-select',
  mode: 'permutation',
  prompt: 'Fill the podium.',
  itemNoun: 'racers',
  pool: [
    { id: 'a', label: 'Tortoise', emoji: '🐢' },
    { id: 'b', label: 'Hare', emoji: '🐇' },
    { id: 'c', label: 'Fox', emoji: '🦊' },
    { id: 'd', label: 'Horse', emoji: '🐎' },
  ],
  slotLabels: ['Gold', 'Silver', 'Bronze'],
  optionFeedback: {
    default: 'One racer is placed each round.',
    specificCases: [],
  },
  questions: [
    {
      id: 'total',
      label: 'Total podiums',
      prompt: 'How many podiums? (4 × 3 × 2)',
      correctValue: 24,
      feedbackWrong: { default: 'Multiply 4 × 3 × 2.', specificCases: [] },
    },
  ],
}

describe('SlotSelectStepView', () => {
  it('rejects a wrong option count and stays on the same slot', async () => {
    const user = userEvent.setup()
    render(<SlotSelectStepView step={permStep} onComplete={vi.fn()} />)

    await user.type(screen.getByLabelText(/available for Gold/i), '2')
    await user.click(screen.getByRole('button', { name: 'Check' }))

    // Wrong answers now surface the hint (a nudge), not the explanatory "wrong" text.
    expect(screen.getByText(/count what is left in the pool/i)).toBeTruthy()
    expect(screen.getByLabelText(/available for Gold/i)).toBeTruthy()
  })

  it('places a racer and advances to the next medal after a correct count', async () => {
    const user = userEvent.setup()
    render(<SlotSelectStepView step={permStep} onComplete={vi.fn()} />)

    await user.type(screen.getByLabelText(/available for Gold/i), '4')
    await user.click(screen.getByRole('button', { name: 'Check' }))

    await waitFor(() => expect(screen.getByLabelText(/available for Silver/i)).toBeTruthy(), {
      timeout: 6000,
    })
  })
})
