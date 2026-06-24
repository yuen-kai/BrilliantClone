import { useState } from 'react'
import type { ColdProblemStep } from '../../types/lesson'
import { resolveFeedback } from '../../lib/feedback'
import { GateInput } from '../lesson/GateInput'
import { FeedbackBanner } from '../lesson/FeedbackBanner'
import './ColdProblemStep.css'

type ColdProblemStepProps = {
  step: ColdProblemStep
  onComplete: (mastered: boolean) => void
}

export function ColdProblemStepView({ step, onComplete }: ColdProblemStepProps) {
  const [problemIndex, setProblemIndex] = useState(0)
  const [feedback, setFeedback] = useState<{ message: string; variant: 'correct' | 'wrong' } | null>(
    null,
  )
  const [showProblemB, setShowProblemB] = useState(false)
  const [errorNonce, setErrorNonce] = useState(0)

  const currentProblem = step.problems[problemIndex]!

  const handleSubmit = (value: number) => {
    if (value === currentProblem.correctValue) {
      setFeedback({ message: 'Correct!', variant: 'correct' })
      setTimeout(() => onComplete(true), 800)
    } else {
      setErrorNonce((n) => n + 1)
      setFeedback({
        message: resolveFeedback(value, currentProblem.feedbackWrong),
        variant: 'wrong',
      })

      if (problemIndex === 0 && step.problems.length > 1) {
        setTimeout(() => {
          setShowProblemB(true)
          setProblemIndex(1)
          setFeedback(null)
        }, 2000)
      } else {
        setTimeout(() => onComplete(false), 2000)
      }
    }
  }

  const multipleProblems = step.problems.length > 1

  return (
    <div className="cold-step">
      <div key={problemIndex} className="cold-step__body">
        <div className="cold-step__head">
          <div className="cold-step__tags">
            <span className={`cold-step__badge ${showProblemB ? 'cold-step__badge--new' : ''}`}>
              {showProblemB ? 'New question' : 'Final check'}
            </span>
            {multipleProblems && (
              <span className="cold-step__counter">
                Problem {problemIndex + 1} of {step.problems.length}
              </span>
            )}
          </div>
          <p className="cold-step__intro">
            {showProblemB
              ? "That one wasn't it. Here's a brand-new problem, same rule, different numbers."
              : "Last step, no tree. Just you and the rule. You've got this."}
          </p>
        </div>
        <p className="cold-step__prompt">{currentProblem.prompt}</p>
        <GateInput label="Your answer" onSubmit={handleSubmit} errorNonce={errorNonce} />
      </div>
      {feedback && <FeedbackBanner message={feedback.message} variant={feedback.variant} />}
    </div>
  )
}
