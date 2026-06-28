import { useEffect, useRef, useState, type FormEvent } from 'react'
import { evaluateExpression, type Op } from '../../lib/mathExpr'
import { useAllowedOps } from './AllowedOpsContext'
import './GateInput.css'

type GateInputProps = {
  label: string
  onSubmit: (value: number) => void
  disabled?: boolean
  /** Bump this whenever the last answer was wrong to refocus + flash the field. */
  errorNonce?: number
  /** Explicit override for the operators the learner may type. When omitted, the
   * set comes from AllowedOpsContext (BASIC + whatever the lesson has unlocked). */
  allowedOps?: Set<Op>
}

function shake(el: HTMLElement | null) {
  if (
    el &&
    typeof el.animate === 'function' &&
    !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  ) {
    el.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-5px)' },
        { transform: 'translateX(5px)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 320, easing: 'ease-in-out' },
    )
  }
}

export function GateInput({
  label,
  onSubmit,
  disabled,
  errorNonce = 0,
  allowedOps,
}: GateInputProps) {
  const contextOps = useAllowedOps()
  const ops = allowedOps ?? contextOps
  const [value, setValue] = useState('')
  const [errored, setErrored] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // errorNonce is shared across a step's gates, so a freshly-mounted input can
  // arrive with it already > 0. Only flash when it actually INCREASES (a new
  // wrong answer), not on mount — otherwise new inputs start out flashing red.
  const lastNonce = useRef(errorNonce)

  useEffect(() => {
    if (errorNonce > lastNonce.current) {
      const el = inputRef.current
      el?.focus()
      el?.select()
      setErrored(true)
      shake(el)
    }
    lastNonce.current = errorNonce
  }, [errorNonce])

  // Live preview: once the input is a valid expression that actually uses an
  // operator (a bare number needs no preview), show what it evaluates to.
  const trimmed = value.trim()
  const live = trimmed ? evaluateExpression(trimmed, ops) : null
  const preview = live && live.ok && live.opsUsed.size > 0 ? live.value : null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const res = evaluateExpression(value, ops)
    if (res.ok) {
      setMessage(null)
      onSubmit(res.value)
    } else if (res.error !== 'empty') {
      setErrored(true)
      setMessage(
        res.error === 'locked' ? res.message : "Couldn't read that — try a number or +, −, ×, ÷, ^.",
      )
      shake(inputRef.current)
      inputRef.current?.focus()
    }
  }

  return (
    <form className="gate-input" onSubmit={handleSubmit}>
      <label className="gate-input__label" htmlFor="gate-answer">
        {label}
      </label>
      <div className="gate-input__row">
        <input
          id="gate-answer"
          ref={inputRef}
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className={`gate-input__field ${errored ? 'is-error' : ''}`}
          aria-invalid={errored}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setErrored(false)
            setMessage(null)
          }}
          disabled={disabled}
          autoFocus
        />
        <button type="submit" className="gate-input__submit" disabled={disabled || !trimmed}>
          Check
        </button>
      </div>
      {preview !== null && <div className="gate-input__preview" aria-live="polite">= {preview}</div>}
      {message && <div className="gate-input__msg">{message}</div>}
    </form>
  )
}
