import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { TeachBackStep } from '../../types/lesson'
import { assessTeaching, scoreCoverage, type TeachTurn } from '../../services/teachBack'
import { useAuth } from '../../context/AuthContext'
import './TeachBackStep.css'

type TeachBackStepProps = {
  step: TeachBackStep
  onComplete: () => void
}

export function TeachBackStepView(props: TeachBackStepProps) {
  const { aiEnabled } = useAuth()
  // With AI on, the tutor checks the explanation live. With AI off (including a
  // demo with the tutor toggled off) we keep the beat as an authored self-check:
  // write the explanation, then grade it against the rubric. Either way it happens.
  return aiEnabled ? <TeachChat {...props} /> : <TeachSelfCheck {...props} />
}

function TeachSelfCheck({ step, onComplete }: TeachBackStepProps) {
  const [explanation, setExplanation] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [covered, setCovered] = useState<boolean[]>(() => step.keyPoints.map(() => false))

  const total = step.keyPoints.length
  const clearCount = covered.filter(Boolean).length
  const wrote = explanation.trim().length > 0

  const toggle = (i: number) => setCovered((prev) => prev.map((v, j) => (j === i ? !v : v)))

  return (
    <div className="teach-step">
      <div className="teach-step__head">
        <div>
          <span className="teach-step__eyebrow">Your turn to teach</span>
          <h2 className="teach-step__title">Teach it back</h2>
        </div>
        {revealed && (
          <span className="teach-step__progress" aria-live="polite">
            {clearCount} of {total} covered
          </span>
        )}
      </div>

      <p className="teach-step__problem">{step.problem}</p>
      <p className="teach-step__lead">
        Write out how you’d solve this in your own words, then check it against the rubric.
      </p>

      <textarea
        className="teach-step__input"
        placeholder="Write out your explanation in your own words…"
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
        rows={5}
        autoFocus
      />

      {revealed && (
        <>
          <div className="teach-step__meter" aria-hidden="true">
            <span
              className="teach-step__meter-fill"
              style={{ width: `${total ? (clearCount / total) * 100 : 0}%` }}
            />
          </div>
          <div className="teach-step__rubric">
            <span className="teach-step__rubric-tag">A solid explanation covers</span>
            <ul>
              {step.keyPoints.map((kp, i) => (
                <li key={i}>
                  <label className="teach-step__rubric-item">
                    <input type="checkbox" checked={covered[i]} onChange={() => toggle(i)} />
                    <span>{kp}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <div className="teach-step__row">
        {!revealed && (
          <button
            type="button"
            className="teach-step__send"
            onClick={() => setRevealed(true)}
            disabled={!wrote}
          >
            Check against the rubric →
          </button>
        )}
        <button
          type="button"
          className={`teach-step__continue ${revealed ? 'is-ready' : ''}`}
          onClick={onComplete}
        >
          Continue to the check →
        </button>
      </div>
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

  const sendTurn = async (text: string) => {
    if (!text || thinking) return

    const conversation: TeachTurn[] = [...turns, { role: 'learner', text }]
    setTurns(conversation)
    setInput('')
    setThinking(true)

    const assessment = await assessTeaching(
      { concept: step.concept, problem: step.problem, keyPoints: step.keyPoints },
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
      { role: 'ai', text: assessment.message || 'Let me help — here’s the idea.' },
    ])
  }

  const handleSend = (e: FormEvent) => {
    e.preventDefault()
    void sendTurn(input.trim())
  }

  // One-click escape when the learner is stuck: asks the tutor to just explain it.
  const askForHelp = () => void sendTurn('I’m stuck — can you explain this part to me?')

  return (
    <div className="teach-step">
      <div className="teach-step__head">
        <div>
          <span className="teach-step__eyebrow">Your turn to teach</span>
          <h2 className="teach-step__title">Teach me how to solve this</h2>
        </div>
        <span className="teach-step__progress" aria-live="polite">
          {clearCount} of {total} ideas clear
        </span>
      </div>
      <p className="teach-step__problem">{step.problem}</p>
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
              void sendTurn(input.trim())
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
          {!solid && (
            <button
              type="button"
              className="teach-step__help"
              onClick={askForHelp}
              disabled={thinking}
            >
              I’m stuck
            </button>
          )}
          {/* Always available so the learner is never trapped — the real test is the final check. */}
          <button
            type="button"
            className={`teach-step__continue ${solid ? 'is-ready' : ''}`}
            onClick={onComplete}
          >
            Continue to the check →
          </button>
        </div>
      </form>
    </div>
  )
}
