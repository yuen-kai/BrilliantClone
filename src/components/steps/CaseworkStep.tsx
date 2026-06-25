import { useState } from 'react'
import type { CaseworkStep } from '../../types/lesson'
import { resolveFeedback } from '../../lib/feedback'
import { CaseworkTrees } from '../visuals/CaseworkTrees'
import { GateInput } from '../lesson/GateInput'
import { FeedbackBanner } from '../lesson/FeedbackBanner'
import './CaseworkStep.css'

type CaseworkStepProps = {
  step: CaseworkStep
  onComplete: () => void
}

type Feedback = { message: string; variant: 'correct' | 'wrong' | 'hint' } | null

export function CaseworkStepView({ step, onComplete }: CaseworkStepProps) {
  // Number of cases answered correctly (also drives how many trees are drawn).
  const [answered, setAnswered] = useState(0)
  const [combined, setCombined] = useState(false)
  const [totalDone, setTotalDone] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [errorNonce, setErrorNonce] = useState(0)

  const n = step.cases.length
  const askingCase = answered < n
  const askingTotal = !askingCase && combined && !totalDone

  const wrong = (message: string) => {
    setErrorNonce((x) => x + 1)
    setFeedback({ message, variant: 'wrong' })
  }

  const submitCase = (value: number) => {
    const c = step.cases[answered]
    if (!c) return
    if (value === c.correctValue) {
      setFeedback({ message: 'Correct!', variant: 'correct' })
      setTimeout(() => {
        setFeedback(null)
        setAnswered((a) => a + 1)
      }, 550)
    } else {
      wrong(resolveFeedback(value, c.feedbackWrong))
    }
  }

  const submitTotal = (value: number) => {
    if (value === step.total.correctValue) {
      setFeedback({ message: 'Correct!', variant: 'correct' })
      setTotalDone(true)
      setTimeout(onComplete, 700)
    } else {
      wrong(resolveFeedback(value, step.total.feedbackWrong))
    }
  }

  return (
    <div className="casework-step">
      <p className="casework-step__prompt">{step.prompt}</p>

      <div className="casework-step__visual">
        <CaseworkTrees
          config={{ parentLabel: step.parentLabel, cases: step.cases }}
          revealedCount={answered}
          combined={combined}
          asking={askingCase}
        />
      </div>

      <ol className="casework-step__gates" aria-label="Count each case, then combine">
        {step.cases.map((c, i) => {
          const confirmed = i < answered
          const current = i === answered && askingCase
          if (!confirmed && !current) return null
          return (
            <li
              key={c.id}
              className={`casework-step__gate ${confirmed ? 'is-confirmed' : 'is-current'}`}
            >
              <span className="casework-step__gate-label">{c.label}</span>
              {confirmed ? (
                <span className="casework-step__gate-solved">
                  {c.revealExpression && (
                    <span className="casework-step__gate-expr">{c.revealExpression}</span>
                  )}
                  <span className="casework-step__gate-value">{c.correctValue}</span>
                </span>
              ) : (
                <div className="casework-step__gate-active">
                  <p className="casework-step__gate-prompt">{c.question}</p>
                  <GateInput label="Your answer" onSubmit={submitCase} errorNonce={errorNonce} />
                </div>
              )}
            </li>
          )
        })}

        {!askingCase && !combined && (
          <li className="casework-step__combine-row">
            <p className="casework-step__combine-hint">
              Both cases counted. Now combine them under one parent.
            </p>
            <button
              type="button"
              className="casework-step__combine"
              onClick={() => setCombined(true)}
              autoFocus
            >
              Combine the cases
            </button>
          </li>
        )}

        {(askingTotal || totalDone) && (
          <li className={`casework-step__gate ${totalDone ? 'is-confirmed' : 'is-current'}`}>
            <span className="casework-step__gate-label">Total</span>
            {totalDone ? (
              <span className="casework-step__gate-solved">
                {step.total.revealExpression && (
                  <span className="casework-step__gate-expr">{step.total.revealExpression}</span>
                )}
                <span className="casework-step__gate-value">{step.total.correctValue}</span>
              </span>
            ) : (
              <div className="casework-step__gate-active">
                <p className="casework-step__gate-prompt">{step.total.question}</p>
                <GateInput label="Your answer" onSubmit={submitTotal} errorNonce={errorNonce} />
              </div>
            )}
          </li>
        )}
      </ol>

      {feedback && <FeedbackBanner message={feedback.message} variant={feedback.variant} />}
    </div>
  )
}
