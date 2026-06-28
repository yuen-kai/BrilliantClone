import type { ChoiceOption } from '../../types/lesson'
import './ChoiceInput.css'

type ChoiceInputProps = {
  options: ChoiceOption[]
  onPick: (optionId: string) => void
  /** Disabled while feedback animates. */
  disabled?: boolean
}

export function ChoiceInput({ options, onPick, disabled }: ChoiceInputProps) {
  return (
    <div className="choice-input" role="group">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className="choice-input__btn"
          onClick={() => onPick(opt.id)}
          disabled={disabled}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
