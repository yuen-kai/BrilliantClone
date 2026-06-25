import { useState } from 'react'
import type { DiscoveryStep, DiscoveryVisual } from '../../types/lesson'
import { resolveFeedback } from '../../lib/feedback'
import { validateSolveBlank } from '../../lib/lessonEngine'
import { HandshakeConnect } from '../visuals/HandshakeConnect'
import { AnagramBoard } from '../visuals/AnagramBoard'
import { RoundTable } from '../visuals/RoundTable'
import { GateInput } from '../lesson/GateInput'
import { FeedbackBanner } from '../lesson/FeedbackBanner'
import './DiscoveryStep.css'

type DiscoveryStepProps = {
  step: DiscoveryStep
  onComplete: () => void
}

function DiscoveryVisualView({ visual }: { visual: DiscoveryVisual }) {
  switch (visual.component) {
    case 'handshake-connect':
      return <HandshakeConnect config={visual.config} />
    case 'anagram-board':
      return <AnagramBoard config={visual.config} />
    case 'round-rotations':
      return <RoundTable seats={visual.seats} />
  }
}

export function DiscoveryStepView({ step, onComplete }: DiscoveryStepProps) {
  const [gateIndex, setGateIndex] = useState(0)
  const [feedback, setFeedback] = useState<{
    message: string
    variant: 'correct' | 'wrong' | 'hint'
  } | null>(null)
  const [errorNonce, setErrorNonce] = useState(0)

  const current = step.gates[gateIndex]

  const handleSubmit = (value: number) => {
    if (!current) return
    if (validateSolveBlank(current, value)) {
      setFeedback({ message: 'Correct!', variant: 'correct' })
      const next = gateIndex + 1
      setTimeout(() => {
        setFeedback(null)
        if (next >= step.gates.length) onComplete()
        else setGateIndex(next)
      }, 550)
    } else {
      setErrorNonce((n) => n + 1)
      // Show only the hint; keep the explanatory text just as a no-hint fallback.
      setFeedback(
        current.hintText
          ? { message: current.hintText, variant: 'hint' }
          : { message: resolveFeedback(value, current.feedbackWrong), variant: 'wrong' },
      )
    }
  }

  const renderGate = (gate: DiscoveryStep['gates'][number], i: number) => {
    const confirmed = i < gateIndex
    const isCurrent = i === gateIndex
    if (!confirmed && !isCurrent) return null
    return (
      <li
        key={gate.id}
        className={`discovery-step__gate ${confirmed ? 'is-confirmed' : 'is-current'}`}
      >
        <span className="discovery-step__gate-label">{gate.label}</span>
        {confirmed ? (
          <span className="discovery-step__gate-solved">
            {gate.revealExpression && (
              <span className="discovery-step__gate-expr">{gate.revealExpression}</span>
            )}
            <span className="discovery-step__gate-value">{gate.correctValue}</span>
          </span>
        ) : (
          <div className="discovery-step__gate-active">
            <p className="discovery-step__gate-prompt">{gate.prompt}</p>
            <GateInput label="Your answer" onSubmit={handleSubmit} errorNonce={errorNonce} />
          </div>
        )}
      </li>
    )
  }

  // Progressive disclosure: "ignoring repeats" (always first) is asked on its
  // own with no widget in sight. Only once it's answered do we reveal the widget
  // together with the "considering repeats" gate, so the repeats appear right
  // when the learner needs to divide them out. Feedback sits next to whichever
  // gate is currently active.
  const [firstGate, ...laterGates] = step.gates
  const currentIsFirst = gateIndex === 0
  const revealed = gateIndex >= 1
  const feedbackEl = feedback ? (
    <FeedbackBanner message={feedback.message} variant={feedback.variant} />
  ) : null

  return (
    <div className="discovery-step">
      <p className="discovery-step__prompt">{step.prompt}</p>

      {firstGate && (
        <ol className="discovery-step__gates" aria-label={firstGate.label}>
          {renderGate(firstGate, 0)}
        </ol>
      )}
      {currentIsFirst && feedbackEl}

      {revealed && (
        <>
          <div className="discovery-step__visual">
            <DiscoveryVisualView visual={step.visual} />
          </div>

          {laterGates.length > 0 && (
            <ol className="discovery-step__gates" aria-label={laterGates[0]?.label}>
              {laterGates.map((gate, i) => renderGate(gate, i + 1))}
            </ol>
          )}

          {feedbackEl}
        </>
      )}
    </div>
  )
}
