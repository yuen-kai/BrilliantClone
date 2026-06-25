import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GateInput } from './GateInput'
import { AllowedOpsContext } from './AllowedOpsContext'
import type { Op } from '../../lib/mathExpr'

describe('GateInput', () => {
  it('evaluates a typed arithmetic expression and submits its value', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<GateInput label="Your answer" onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Your answer'), '6*5/2')
    expect(screen.getByText('= 15')).toBeTruthy() // live preview

    await user.click(screen.getByRole('button', { name: 'Check' }))
    expect(onSubmit).toHaveBeenCalledWith(15)
  })

  it('still accepts a plain number', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<GateInput label="Your answer" onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Your answer'), '15')
    await user.click(screen.getByRole('button', { name: 'Check' }))
    expect(onSubmit).toHaveBeenCalledWith(15)
  })

  it('does not start in the error state when errorNonce is already > 0 on mount', () => {
    render(<GateInput label="Your answer" onSubmit={vi.fn()} errorNonce={3} />)
    expect(screen.getByLabelText('Your answer').className).not.toContain('is-error')
  })

  it('locks advanced operators (factorial) until unlocked', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<GateInput label="Your answer" onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Your answer'), '5!')
    await user.click(screen.getByRole('button', { name: 'Check' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(document.querySelector('.gate-input__msg')).toBeTruthy()
  })

  it('accepts an advanced operator once the context unlocks it', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <AllowedOpsContext.Provider value={new Set<Op>(['+', '-', '*', '/', '!'])}>
        <GateInput label="Your answer" onSubmit={onSubmit} />
      </AllowedOpsContext.Provider>,
    )

    await user.type(screen.getByLabelText('Your answer'), '5!')
    expect(screen.getByText('= 120')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Check' }))

    expect(onSubmit).toHaveBeenCalledWith(120)
  })
})
