import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TeachBackStepView } from './TeachBackStep'
import type { TeachBackStep } from '../../types/lesson'

const step: TeachBackStep = {
  id: 'step-teach-back',
  step: 5,
  type: 'teach-back',
  concept: 'the multiplication principle',
  problem: 'A sandwich has 3 breads and 2 fillings. How many sandwiches?',
  prompt: 'Teach me how you’d solve this.',
  keyPoints: ['idea one', 'idea two'],
}

// Force the no-AI path: the authored self-check stands in for the live tutor.
vi.mock('../../context/AuthContext', () => ({ useAuth: () => ({ aiEnabled: false }) }))

describe('TeachBackStep (no AI)', () => {
  it('reveals the rubric only after the learner writes an explanation', async () => {
    render(<TeachBackStepView step={step} onComplete={vi.fn()} />)

    // No AI chat, and the rubric ideas stay hidden until they write and check.
    expect(screen.queryByPlaceholderText(/teach the idea/i)).not.toBeInTheDocument()
    expect(screen.queryByText('idea one')).not.toBeInTheDocument()

    const check = screen.getByRole('button', { name: /check against the rubric/i })
    expect(check).toBeDisabled()

    await userEvent.type(screen.getByPlaceholderText(/your own words/i), 'multiply the options')
    expect(check).toBeEnabled()
    await userEvent.click(check)

    expect(screen.getByText('idea one')).toBeInTheDocument()
    expect(screen.getByText('idea two')).toBeInTheDocument()
  })

  it('tracks how many rubric ideas the learner ticks off', async () => {
    render(<TeachBackStepView step={step} onComplete={vi.fn()} />)
    await userEvent.type(screen.getByPlaceholderText(/your own words/i), 'an explanation')
    await userEvent.click(screen.getByRole('button', { name: /check against the rubric/i }))

    expect(screen.getByText('0 of 2 covered')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('checkbox', { name: /idea one/i }))
    expect(screen.getByText('1 of 2 covered')).toBeInTheDocument()
  })

  it('lets the learner continue to the final check without being trapped', async () => {
    const onComplete = vi.fn()
    render(<TeachBackStepView step={step} onComplete={onComplete} />)
    await userEvent.click(screen.getByRole('button', { name: /continue to the check/i }))
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
