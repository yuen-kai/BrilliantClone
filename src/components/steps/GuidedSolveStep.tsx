import { useCallback, useState } from 'react'
import type { GuidedSolveStep } from '../../types/lesson'
import { resolveFeedback } from '../../lib/feedback'
import { validateSolveBlank } from '../../lib/lessonEngine'
import { GateInput } from '../lesson/GateInput'
import { FeedbackBanner } from '../lesson/FeedbackBanner'
import { GuidedVisualView } from '../visuals/GuidedVisual'
import './GuidedSolveStep.css'

type GuidedSolveStepProps = {
  step: GuidedSolveStep
  onComplete: () => void
}

export function GuidedSolveStepView({ step, onComplete }: GuidedSolveStepProps) {
  const [blankIndex, setBlankIndex] = useState(0)
  const [feedback, setFeedback] = useState<{
    message: string
    variant: 'correct' | 'wrong' | 'hint'
  } | null>(null)
  const [errorNonce, setErrorNonce] = useState(0)
  const [done, setDone] = useState(false)

  const currentBlank = step.blanks[blankIndex]

  // On a wrong answer show only the hint (a leading nudge) — not the explanatory
  // "wrong" text. Fall back to the message just for blanks that have no hint.
  const showWrong = useCallback(
    (blankHint: string | undefined, message: string) => {
      setErrorNonce((n) => n + 1)
      setFeedback(
        blankHint ? { message: blankHint, variant: 'hint' } : { message, variant: 'wrong' },
      )
    },
    [],
  )

  const handleSubmit = (value: number) => {
    if (!currentBlank) return
    if (validateSolveBlank(currentBlank, value)) {
      setFeedback({ message: 'Correct!', variant: 'correct' })
      const next = blankIndex + 1
      if (next >= step.blanks.length) {
        setTimeout(() => {
          setDone(true)
          setFeedback(null)
        }, 500)
      } else {
        setTimeout(() => {
          setBlankIndex(next)
          setFeedback(null)
        }, 500)
      }
    } else {
      showWrong(currentBlank.hintText, resolveFeedback(value, currentBlank.feedbackWrong))
    }
  }

  return (
    <div className="guided-step">
      <p className="guided-step__prompt">{step.prompt}</p>
      {step.intro && <p className="guided-step__intro">{step.intro}</p>}

      {step.visual && (
        <div className="guided-step__visual">
          <GuidedVisualView visual={step.visual} />
        </div>
      )}

      <ol className="guided-step__ledger" aria-label="Worked solution">
        {step.blanks.map((blank, i) => {
          const confirmed = i < blankIndex || (done && i === step.blanks.length - 1)
          const current = !done && i === blankIndex
          if (!confirmed && !current) return null

          return (
            <li
              key={blank.id}
              className={`guided-step__row ${confirmed ? 'is-confirmed' : ''} ${
                current ? 'is-current' : ''
              }`}
            >
              <span className="guided-step__row-label">{blank.label}</span>
              {confirmed ? (
                <span className="guided-step__row-solved">
                  {blank.revealExpression && (
                    <span className="guided-step__expr">{blank.revealExpression}</span>
                  )}
                  <span className="guided-step__row-value">{blank.correctValue}</span>
                </span>
              ) : (
                <div className="guided-step__row-active">
                  <p className="guided-step__row-prompt">{blank.prompt}</p>
                  <GateInput label="Your answer" onSubmit={handleSubmit} errorNonce={errorNonce} />
                </div>
              )}
            </li>
          )
        })}
      </ol>

      {feedback && <FeedbackBanner message={feedback.message} variant={feedback.variant} />}

      {done && (
        <div className="guided-step__finish">
          <p className="guided-step__result">
            {step.blanks[step.blanks.length - 1]?.correctValue}
            {step.resultLabel ? ` ${step.resultLabel}` : ''}. Nice work.
          </p>
          <button type="button" className="guided-step__continue" onClick={onComplete}>
            Continue
          </button>
        </div>
      )}
    </div>
  )
}
