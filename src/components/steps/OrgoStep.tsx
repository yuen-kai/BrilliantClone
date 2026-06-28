import { useState } from 'react'
import type { OrgoGate, OrgoStep, OrgoVisual } from '../../types/orgo'
import { isChoiceGate } from '../../types/orgo'
import { resolveFeedback } from '../../lib/feedback'
import { GateInput } from '../lesson/GateInput'
import { ChoiceInput } from '../lesson/ChoiceInput'
import { FeedbackBanner } from '../lesson/FeedbackBanner'
import { ArrowPush } from '../visuals/ArrowPush'
import { BacksideAttack } from '../visuals/BacksideAttack'
import { CarbocationFaces } from '../visuals/CarbocationFaces'
import { NewmanDial } from '../visuals/NewmanDial'
import { E1Route } from '../visuals/E1Route'
import { PathwayConsole } from '../visuals/PathwayConsole'
import './OrgoStep.css'

function OrgoVisualView({ visual, onSolved }: { visual: OrgoVisual; onSolved: () => void }) {
  switch (visual.component) {
    case 'arrow-push':
      return <ArrowPush config={visual.config} onSolved={onSolved} />
    case 'backside-attack':
      return <BacksideAttack config={visual.config} onSolved={onSolved} />
    case 'carbocation-faces':
      return <CarbocationFaces config={visual.config} onSolved={onSolved} />
    case 'newman-dial':
      return <NewmanDial config={visual.config} onSolved={onSolved} />
    case 'e1-route':
      return <E1Route config={visual.config} onSolved={onSolved} />
    case 'pathway-console':
      return <PathwayConsole config={visual.config} onSolved={onSolved} />
  }
}

export function OrgoStepView({ step, onComplete }: { step: OrgoStep; onComplete: () => void }) {
  const gated = !!step.gateOnSolved && !!step.visual
  const [unlocked, setUnlocked] = useState(!gated)
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
    }, 560)
  }

  const submitNumber = (gate: Extract<OrgoGate, { correctValue: number }>, value: number) => {
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

  const pickChoice = (gate: Extract<OrgoGate, { options: unknown }>, optionId: string) => {
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

  const renderGate = (gate: OrgoGate, i: number) => {
    const confirmed = i < gateIndex
    const isCurrent = i === gateIndex
    if (!confirmed && !isCurrent) return null
    return (
      <li key={gate.id} className={`orgo-step__gate ${confirmed ? 'is-confirmed' : 'is-current'}`}>
        <span className="orgo-step__gate-label">{gate.label}</span>
        {confirmed ? (
          <span className="orgo-step__gate-solved">
            {isChoiceGate(gate)
              ? gate.options.find((o) => o.id === gate.correctId)?.label
              : (gate.revealExpression ?? gate.correctValue)}
          </span>
        ) : (
          <div className="orgo-step__gate-active">
            <p className="orgo-step__gate-prompt">{gate.prompt}</p>
            {isChoiceGate(gate) ? (
              <ChoiceInput options={gate.options} onPick={(id) => pickChoice(gate, id)} />
            ) : (
              <GateInput
                label="Your answer"
                onSubmit={(v) => submitNumber(gate, v)}
                errorNonce={errorNonce}
                allowedOps={new Set()}
              />
            )}
          </div>
        )}
      </li>
    )
  }

  return (
    <div className="orgo-step">
      <p className="orgo-step__prompt">{step.prompt}</p>

      {step.visual && (
        <div className="orgo-step__visual">
          <OrgoVisualView visual={step.visual} onSolved={() => setUnlocked(true)} />
        </div>
      )}

      {!unlocked && (
        <p className="orgo-step__wait">
          {step.gateOnSolvedHint ?? 'Drive the reaction above to continue.'}
        </p>
      )}

      {unlocked && (
        <>
          <ol className="orgo-step__gates">{step.gates.map(renderGate)}</ol>
          {feedback && <FeedbackBanner message={feedback.message} variant={feedback.variant} />}
        </>
      )}
    </div>
  )
}
