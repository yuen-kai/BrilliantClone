import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GateInput } from './GateInput'

describe('GateInput', () => {
  it('submits numeric answer on check', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<GateInput label="How many nodes?" onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('How many nodes?'), '12')
    await user.click(screen.getByRole('button', { name: 'Check' }))

    expect(onSubmit).toHaveBeenCalledWith(12)
  })

  it('does not submit when empty', () => {
    const onSubmit = vi.fn()
    render(<GateInput label="Answer" onSubmit={onSubmit} />)
    const button = screen.getByRole('button', { name: 'Check' }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })
})
