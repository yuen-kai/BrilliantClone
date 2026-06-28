import { useState } from 'react'
import type { MechanismGate, MechanismStep, MechanismVisual } from '../../types/lesson'
import { resolveFeedback } from '../../lib/feedback'
import { GateInput } from '../lesson/GateInput'
import { ChoiceInput } from '../lesson/ChoiceInput'
import { FeedbackBanner } from '../lesson/FeedbackBanner'
import { MechanismCanvas } from '../visuals/MechanismCanvas'
import { ReactionStage } from '../visuals/ReactionStage'
import { NewmanEliminate } from '../visuals/NewmanEliminate'
import { RateLab } from '../visuals/RateLab'
import { ReactionConsole } from '../visuals/ReactionConsole'
import { MechanismTree } from '../visuals/MechanismTree'
import './MechanismStep.css'

const isChoice = (gate: MechanismGate): gate is Extract<MechanismGate, { options: unknown }> =>
  'options' in gate

function MechanismVisualView({
  visual,
  onSolved,
}: {
  visual: MechanismVisual
  onSolved: () => void
}) {
  switch (visual.component) {
    case 'mechanism-canvas':
      return <MechanismCanvas config={visual.config} onSolved={onSolved} />
    case 'reaction-stage':
      return <ReactionStage config={visual.config} onSolved={onSolved} />
    case 'newman-eliminate':
      return <NewmanEliminate config={visual.config} onSolved={onSolved} />
    case 'rate-lab':
      return <RateLab config={visual.config} onSolved={onSolved} />
    case 'reaction-console':
      return <ReactionConsole config={visual.config} onSolved={onSolved} />
    case 'mechanism-tree':
      return <MechanismTree config={visual.config} onSolved={onSolved} />
  }
}

export function MechanismStepView({
  step,
  onComplete,
}: {
  step: MechanismStep
  onComplete: () => void
}) {
  const [unlocked, setUnlocked] = useState(!step.gateOnSolved)
  const [gateIndex, setGateIndex] = useState(0)
  const [feedback, setFeedback] = useState<{
    message: string
    variant: 'correct' | 'wrong' | 'hint'
  } | null>(null)
  const [errorNonce, setErrorNonce] = useState(0)

  const advance = () => {
    const next = gateIndex + 1
    setTimeout(() => {
      setFeedback(null)
      if (next >= step.gates.length) onComplete()
      else setGateIndex(next)
    }, 550)
  }

  const submitNumber = (gate: Extract<MechanismGate, { correctValue: number }>, value: number) => {
    if (value === gate.correctValue) {
      setFeedback({ message: 'Correct!', variant: 'correct' })
      advance()
    } else {
      setErrorNonce((n) => n + 1)
      setFeedback(
        gate.hintText
          ? { message: gate.hintText, variant: 'hint' }
          : { message: resolveFeedback(value, gate.feedbackWrong), variant: 'wrong' },
      )
    }
  }

  const pickChoice = (gate: Extract<MechanismGate, { options: unknown }>, optionId: string) => {
    if (optionId === gate.correctId) {
      setFeedback({ message: 'Correct!', variant: 'correct' })
      advance()
    } else {
      setErrorNonce((n) => n + 1)
      setFeedback({
        message: gate.hintText ?? gate.feedback.byOption?.[optionId] ?? gate.feedback.wrong,
        variant: gate.hintText ? 'hint' : 'wrong',
      })
    }
  }

  const renderGate = (gate: MechanismGate, i: number) => {
    const confirmed = i < gateIndex
    const isCurrent = i === gateIndex
    if (!confirmed && !isCurrent) return null
    return (
      <li
        key={gate.id}
        className={`mech-step__gate ${confirmed ? 'is-confirmed' : 'is-current'}`}
      >
        <span className="mech-step__gate-label">{gate.label}</span>
        {confirmed ? (
          <span className="mech-step__gate-solved">
            {isChoice(gate)
              ? gate.options.find((o) => o.id === gate.correctId)?.label
              : gate.correctValue}
          </span>
        ) : (
          <div className="mech-step__gate-active">
            <p className="mech-step__gate-prompt">{gate.prompt}</p>
            {isChoice(gate) ? (
              <ChoiceInput options={gate.options} onPick={(id) => pickChoice(gate, id)} />
            ) : (
              <GateInput label="Your answer" onSubmit={(v) => submitNumber(gate, v)} errorNonce={errorNonce} />
            )}
          </div>
        )}
      </li>
    )
  }

  return (
    <div className="mech-step">
      <p className="mech-step__prompt">{step.prompt}</p>

      <div className="mech-step__visual">
        <MechanismVisualView visual={step.visual} onSolved={() => setUnlocked(true)} />
      </div>

      {!unlocked && (
        <p className="mech-step__hint-wait">Drive the reaction above to continue.</p>
      )}

      {unlocked && (
        <>
          <ol className="mech-step__gates">{step.gates.map(renderGate)}</ol>
          {feedback && <FeedbackBanner message={feedback.message} variant={feedback.variant} />}
        </>
      )}
    </div>
  )
}
