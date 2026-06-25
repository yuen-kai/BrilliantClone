import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClassifyStepView } from './ClassifyStep'
import type { ClassifyStep } from '../../types/lesson'

const step: ClassifyStep = {
  id: 'classify',
  step: 1,
  type: 'classify',
  prompt: 'Permutation or combination?',
  scenarios: [
    {
      id: 's1',
      text: 'Pick a president then a vice-president.',
      answer: 'permutation',
      hint: 'The two roles are different jobs.',
    },
    {
      id: 's2',
      text: 'Grab three snacks for the trip.',
      answer: 'combination',
      hint: 'Bag order changes nothing.',
    },
    {
      id: 's3',
      text: 'Award gold and silver to two runners.',
      answer: 'permutation',
      hint: 'The two medals are not equal.',
    },
  ],
}

describe('ClassifyStepView', () => {
  it('shows the first scenario and both choice buttons', () => {
    render(<ClassifyStepView step={step} onComplete={vi.fn()} />)

    expect(screen.getByText('Pick a president then a vice-president.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Permutation' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Combination' })).toBeTruthy()
  })

  it('surfaces the hint on a wrong pick without advancing or completing', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<ClassifyStepView step={step} onComplete={onComplete} />)

    // First scenario is a permutation; pick the wrong kind.
    await user.click(screen.getByRole('button', { name: 'Combination' }))

    expect(screen.getByText('The two roles are different jobs.')).toBeTruthy()
    // Still on the first scenario, and we never name the right answer.
    expect(screen.getByText('Pick a president then a vice-president.')).toBeTruthy()
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('completes once after every scenario is answered correctly', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<ClassifyStepView step={step} onComplete={onComplete} />)

    await user.click(screen.getByRole('button', { name: 'Permutation' }))

    await waitFor(() => expect(screen.getByText('Grab three snacks for the trip.')).toBeTruthy())
    await user.click(screen.getByRole('button', { name: 'Combination' }))

    await waitFor(() => expect(screen.getByText('Award gold and silver to two runners.')).toBeTruthy())
    await user.click(screen.getByRole('button', { name: 'Permutation' }))

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1), { timeout: 4000 })
  })
})
