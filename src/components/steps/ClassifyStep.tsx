import { useEffect, useState } from 'react'
import type { ClassifyScenario, ClassifyStep } from '../../types/lesson'
import { FeedbackBanner } from '../lesson/FeedbackBanner'
import './ClassifyStep.css'

type ClassifyStepProps = {
  step: ClassifyStep
  onComplete: () => void
}

type Choice = ClassifyScenario['answer']

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

const TYPE_LABEL: Record<Choice, string> = {
  permutation: 'Permutation',
  combination: 'Combination',
}

export function ClassifyStepView({ step, onComplete }: ClassifyStepProps) {
  const [index, setIndex] = useState(0)
  const [solved, setSolved] = useState<ClassifyScenario[]>([])
  const [hint, setHint] = useState<string | null>(null)
  const [wrongChoice, setWrongChoice] = useState<Choice | null>(null)
  const [done, setDone] = useState(false)

  // Brief confirmation beat before handing off, so the learner sees they cleared
  // the whole set rather than the screen vanishing under them.
  useEffect(() => {
    if (!done) return
    const t = setTimeout(onComplete, 700)
    return () => clearTimeout(t)
  }, [done, onComplete])

  const current = step.scenarios[index]

  const handlePick = (choice: Choice, el: HTMLButtonElement) => {
    if (done || !current) return
    if (choice === current.answer) {
      setHint(null)
      setWrongChoice(null)
      setSolved((prev) => [...prev, current])
      const next = index + 1
      if (next >= step.scenarios.length) setDone(true)
      else setIndex(next)
    } else {
      // Never name the right answer — only flash the wrong pick and nudge.
      setWrongChoice(choice)
      setHint(current.hint)
      shake(el)
    }
  }

  return (
    <div className="classify-step">
      <p className="classify-step__prompt">{step.prompt}</p>

      {solved.length > 0 && (
        <ol className="classify-step__ledger" aria-label="Sorted so far">
          {solved.map((s) => (
            <li key={s.id} className="classify-row">
              <span className="classify-row__text">{s.text}</span>
              <span className={`classify-tag classify-tag--${s.answer}`}>
                {TYPE_LABEL[s.answer]}
              </span>
            </li>
          ))}
        </ol>
      )}

      {!done && current ? (
        <div className="classify-step__active">
          <span className="classify-step__progress">
            {index + 1} of {step.scenarios.length}
          </span>
          <p className="classify-step__scenario">{current.text}</p>

          <div className="classify-step__choices">
            <button
              type="button"
              className={`classify-choice ${wrongChoice === 'permutation' ? 'is-wrong' : ''}`}
              onClick={(e) => handlePick('permutation', e.currentTarget)}
            >
              <span className="classify-choice__type">Permutation</span>
              <span className="classify-choice__sub" aria-hidden="true">
                order matters
              </span>
            </button>
            <button
              type="button"
              className={`classify-choice ${wrongChoice === 'combination' ? 'is-wrong' : ''}`}
              onClick={(e) => handlePick('combination', e.currentTarget)}
            >
              <span className="classify-choice__type">Combination</span>
              <span className="classify-choice__sub" aria-hidden="true">
                order doesn’t matter
              </span>
            </button>
          </div>

          <div className="classify-step__feedback" aria-live="polite">
            {hint && <FeedbackBanner message={hint} variant="hint" />}
          </div>
        </div>
      ) : (
        <FeedbackBanner message="Nice. You can tell them apart now." variant="correct" />
      )}
    </div>
  )
}
