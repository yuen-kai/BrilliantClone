import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { TeachBackStepView } from './TeachBackStep'
import type { TeachBackStep } from '../../types/lesson'

const step: TeachBackStep = {
  id: 'step-teach-back',
  step: 5,
  type: 'teach-back',
  concept: 'the multiplication principle',
  problem: 'A sandwich has 3 breads and 2 fillings — how many sandwiches?',
  prompt: 'Teach me how you’d solve this.',
  keyPoints: ['idea one', 'idea two'],
}

// Keep the real scoreCoverage; stub the network call.
vi.mock('../../services/teachBack', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/teachBack')>()
  return { ...actual, assessTeaching: vi.fn() }
})
// Force the live-tutor path on.
vi.mock('../../context/AuthContext', () => ({ useAuth: () => ({ aiEnabled: true }) }))
import { assessTeaching } from '../../services/teachBack'

describe('TeachBackStep', () => {
  beforeEach(() => {
    ;(assessTeaching as Mock).mockReset()
  })

  it('shows the problem, a teach button, and always-available escape hatches', () => {
    render(<TeachBackStepView step={step} onComplete={vi.fn()} />)
    expect(screen.getByText(step.problem)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/teach the idea/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Teach the AI' })).toBeInTheDocument()
    // The learner is never trapped: "I'm stuck" and Continue are there from the start.
    expect(screen.getByRole('button', { name: /I.?m stuck/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Continue to the check/ })).toBeInTheDocument()
  })

  it('asks the tutor to explain when the learner clicks "I’m stuck"', async () => {
    ;(assessTeaching as Mock).mockResolvedValue({
      correct: [],
      corrections: [],
      message: 'No problem — here’s the idea: you multiply the options at each step.',
      solid: false,
    })
    render(<TeachBackStepView step={step} onComplete={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: /I.?m stuck/i }))

    expect(assessTeaching).toHaveBeenCalledTimes(1)
    expect(await screen.findByText(/here.s the idea/i)).toBeInTheDocument()
  })

  it('lets the learner continue immediately without engaging', async () => {
    const onComplete = vi.fn()
    render(<TeachBackStepView step={step} onComplete={onComplete} />)
    await userEvent.click(screen.getByRole('button', { name: /Continue to the check/ }))
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('shows the AI correction and surfaces fixes when the explanation is incomplete', async () => {
    ;(assessTeaching as Mock).mockResolvedValue({
      correct: ['idea one'],
      corrections: ['say more about why it works'],
      message: 'Good start.',
      solid: false,
    })
    render(<TeachBackStepView step={step} onComplete={vi.fn()} />)

    await userEvent.type(screen.getByPlaceholderText(/teach the idea/i), 'my partial explanation')
    await userEvent.click(screen.getByRole('button', { name: 'Teach the AI' }))

    expect(await screen.findByText('Good start.')).toBeInTheDocument()
    expect(screen.getByText('say more about why it works')).toBeInTheDocument()
    // Continue is offered once they've taught at least once.
    expect(screen.getByRole('button', { name: /Continue to the check/ })).toBeInTheDocument()
  })

  it('advances to the final check when the learner continues', async () => {
    ;(assessTeaching as Mock).mockResolvedValue({
      correct: step.keyPoints,
      corrections: [],
      message: 'Perfect.',
      solid: true,
    })
    const onComplete = vi.fn()
    render(<TeachBackStepView step={step} onComplete={onComplete} />)

    await userEvent.type(screen.getByPlaceholderText(/teach the idea/i), 'a complete explanation')
    await userEvent.click(screen.getByRole('button', { name: 'Teach the AI' }))

    await userEvent.click(await screen.findByRole('button', { name: /Continue to the check/ }))
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('still lets the learner continue if the AI is unreachable', async () => {
    ;(assessTeaching as Mock).mockResolvedValue(null)
    render(<TeachBackStepView step={step} onComplete={vi.fn()} />)

    await userEvent.type(screen.getByPlaceholderText(/teach the idea/i), 'attempt')
    await userEvent.click(screen.getByRole('button', { name: 'Teach the AI' }))

    expect(await screen.findByText(/couldn.t reach the tutor/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Continue to the check/ })).toBeInTheDocument()
  })
})
