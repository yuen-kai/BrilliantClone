import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GuidedSolveStepView } from './GuidedSolveStep'
import type { GuidedSolveStep } from '../../types/lesson'

const step: GuidedSolveStep = {
  id: 'demo',
  step: 1,
  type: 'guided-solve',
  prompt: 'Choose 2 of 5 friends.',
  resultLabel: 'pairs',
  blanks: [
    {
      id: 'ordered',
      label: 'Ordered picks',
      prompt: 'How many ordered picks? (5 × 4)',
      correctValue: 20,
      feedbackWrong: {
        default: 'Multiply 5 × 4.',
        specificCases: [{ answer: 9, message: 'That is 5 + 4, multiply instead.' }],
      },
    },
    {
      id: 'divide',
      label: 'Actual pairs',
      prompt: 'How many real pairs? (20 ÷ 2)',
      correctValue: 10,
      feedbackWrong: { default: 'Divide by 2.', specificCases: [] },
    },
  ],
}

describe('GuidedSolveStepView', () => {
  it('reveals one blank at a time and completes after the last', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<GuidedSolveStepView step={step} onComplete={onComplete} />)

    // Only the first blank's prompt is shown initially.
    expect(screen.getByText('How many ordered picks? (5 × 4)')).toBeTruthy()
    expect(screen.queryByText('How many real pairs? (20 ÷ 2)')).toBeNull()

    await user.type(screen.getByLabelText('Your answer'), '20')
    await user.click(screen.getByRole('button', { name: 'Check' }))

    // Second blank appears once the first is correct.
    await waitFor(() =>
      expect(screen.getByText('How many real pairs? (20 ÷ 2)')).toBeTruthy(),
    )

    await user.type(screen.getByLabelText('Your answer'), '10')
    await user.click(screen.getByRole('button', { name: 'Check' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy())
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('shows specific feedback on a wrong answer and does not advance', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<GuidedSolveStepView step={step} onComplete={onComplete} />)

    await user.type(screen.getByLabelText('Your answer'), '9')
    await user.click(screen.getByRole('button', { name: 'Check' }))

    expect(screen.getByText('That is 5 + 4, multiply instead.')).toBeTruthy()
    expect(screen.queryByText('How many real pairs? (20 ÷ 2)')).toBeNull()
  })
})
