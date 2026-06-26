import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { TeachBackStep } from '../../types/lesson'
import { assessTeaching, isAiConfigured, scoreCoverage, type TeachTurn } from '../../services/teachBack'
import './TeachBackStep.css'

type TeachBackStepProps = {
  step: TeachBackStep
  onComplete: () => void
}

export function TeachBackStepView(props: TeachBackStepProps) {
  // No key → the tutor genuinely can't run, so say so (no fabricated replies).
  return isAiConfigured ? <TeachChat {...props} /> : <TeachUnavailable {...props} />
}

function TeachUnavailable({ step, onComplete }: TeachBackStepProps) {
  return (
    <div className="teach-step">
      <div className="teach-step__head">
        <div>
          <span className="teach-step__eyebrow">Your turn to teach</span>
          <h2 className="teach-step__title">Explain {step.concept}</h2>
        </div>
      </div>
      <div className="teach-step__unavailable">
        <p className="teach-step__unavailable-title">The teach-it-back tutor isn’t available.</p>
        <p className="teach-step__unavailable-sub">
          It needs an Anthropic API key (Claude). Set <code>VITE_ANTHROPIC_API_KEY</code> to turn on
          the live tutor — for now you can head straight to the final check.
        </p>
      </div>
      <button type="button" className="teach-step__send" onClick={onComplete} autoFocus>
        Continue to the check →
      </button>
    </div>
  )
}

function TeachChat({ step, onComplete }: TeachBackStepProps) {
  const [turns, setTurns] = useState<TeachTurn[]>([{ role: 'ai', text: step.prompt }])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [score, setScore] = useState(0)
  const [corrections, setCorrections] = useState<string[]>([])
  const [solid, setSolid] = useState(false)
  const [taught, setTaught] = useState(false)
  const threadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = threadRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [turns, thinking])

  const total = step.keyPoints.length
  const clearCount = Math.round(score * total)

  const handleSend = async (e: FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || thinking) return

    const conversation: TeachTurn[] = [...turns, { role: 'learner', text }]
    setTurns(conversation)
    setInput('')
    setThinking(true)

    const assessment = await assessTeaching(
      { concept: step.concept, keyPoints: step.keyPoints },
      conversation,
    )
    setThinking(false)
    setTaught(true)

    if (!assessment) {
      setTurns((prev) => [
        ...prev,
        { role: 'ai', text: 'I couldn’t reach the tutor just now — you can continue to the final check.' },
      ])
      return
    }

    setScore(scoreCoverage(step.keyPoints, assessment.correct))
    setSolid(assessment.solid)
    setCorrections(assessment.corrections)
    setTurns((prev) => [
      ...prev,
      { role: 'ai', text: assessment.message || 'Tell me a bit more about that.' },
    ])
  }

  return (
    <div className="teach-step">
      <div className="teach-step__head">
        <div>
          <span className="teach-step__eyebrow">Your turn to teach</span>
          <h2 className="teach-step__title">Explain {step.concept}</h2>
        </div>
        <span className="teach-step__progress" aria-live="polite">
          {clearCount} of {total} ideas clear
        </span>
      </div>
      <div className="teach-step__meter" aria-hidden="true">
        <span className="teach-step__meter-fill" style={{ width: `${score * 100}%` }} />
      </div>

      <div className="teach-step__thread" ref={threadRef}>
        {turns.map((t, i) => (
          <div key={i} className={`teach-bubble teach-bubble--${t.role}`}>
            {t.text}
          </div>
        ))}
        {thinking && (
          <div className="teach-bubble teach-bubble--ai teach-bubble--thinking">
            <span className="teach-step__dot" />
            <span className="teach-step__dot" />
            <span className="teach-step__dot" />
          </div>
        )}
      </div>

      {!solid && corrections.length > 0 && (
        <div className="teach-step__corrections">
          <span className="teach-step__corrections-tag">To fix</span>
          <ul>
            {corrections.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {solid && (
        <div className="teach-step__solid">You explained the whole idea — you’re ready for the check.</div>
      )}

      <form className="teach-step__compose" onSubmit={handleSend}>
        <textarea
          className="teach-step__input"
          placeholder="Teach the idea in your own words…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void handleSend(e)
            }
          }}
          rows={3}
          disabled={thinking}
          autoFocus
        />
        <div className="teach-step__row">
          <button type="submit" className="teach-step__send" disabled={thinking || !input.trim()}>
            {taught ? 'Send' : 'Teach the AI'}
          </button>
          {taught && (
            <button
              type="button"
              className={`teach-step__continue ${solid ? 'is-ready' : ''}`}
              onClick={onComplete}
            >
              Continue to the check →
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
