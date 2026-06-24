import { useEffect, useRef, useState, type FormEvent } from 'react'
import './GateInput.css'

type GateInputProps = {
  label: string
  onSubmit: (value: number) => void
  disabled?: boolean
  /** Bump this whenever the last answer was wrong to refocus + select the field. */
  errorNonce?: number
}

export function GateInput({ label, onSubmit, disabled, errorNonce = 0 }: GateInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (errorNonce > 0) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [errorNonce])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const num = parseInt(value, 10)
    if (!Number.isNaN(num)) {
      onSubmit(num)
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
          type="number"
          inputMode="numeric"
          className="gate-input__field"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          min={0}
          autoFocus
        />
        <button type="submit" className="gate-input__submit" disabled={disabled || !value}>
          Check
        </button>
      </div>
    </form>
  )
}
