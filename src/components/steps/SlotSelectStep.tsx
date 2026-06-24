import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { SlotItem, SlotSelectStep } from '../../types/lesson'
import { resolveFeedback } from '../../lib/feedback'
import { TreeBuild } from '../tree/TreeBuild'
import { GateInput } from '../lesson/GateInput'
import { FeedbackBanner } from '../lesson/FeedbackBanner'
import './SlotSelectStep.css'

type SlotSelectStepProps = {
  step: SlotSelectStep
  onComplete: () => void
}

type Phase = 'option' | 'selecting' | 'reveal' | 'questions' | 'done'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  // Guarantee a visible change for small groups.
  if (a.length > 1 && a.every((x, i) => x === arr[i])) {
    ;[a[0], a[1]] = [a[1], a[0]]
  }
  return a
}

export function SlotSelectStepView({ step, onComplete }: SlotSelectStepProps) {
  const { pool, slotLabels, mode } = step
  const n = pool.length
  const k = slotLabels.length

  const [picked, setPicked] = useState<SlotItem[]>([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>(mode === 'permutation' ? 'option' : 'selecting')
  const [rouletteId, setRouletteId] = useState<string | null>(null)
  const [winnerId, setWinnerId] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [reordering, setReordering] = useState(false)
  const [qIndex, setQIndex] = useState(0)
  const [feedback, setFeedback] = useState<{
    message: string
    variant: 'correct' | 'wrong' | 'hint'
  } | null>(null)
  const [errorNonce, setErrorNonce] = useState(0)

  const pickedIds = useRef<Set<string>>(new Set())
  pickedIds.current = new Set(picked.map((p) => p.id))
  const remaining = pool.filter((p) => !pickedIds.current.has(p.id))

  // FLIP: remember each chosen item's on-screen box so it can slide (not jump)
  // to its new spot when the group reorders.
  const itemEls = useRef(new Map<string, HTMLDivElement>())
  const prevRects = useRef(new Map<string, DOMRect>())
  const setItemEl = (id: string) => (el: HTMLDivElement | null) => {
    if (el) itemEls.current.set(id, el)
    else itemEls.current.delete(id)
  }

  // --- Roulette selection animation (both modes) ---
  useEffect(() => {
    if (phase !== 'selecting') return
    const pickFrom = pool.filter((p) => !pickedIds.current.has(p.id))
    if (pickFrom.length === 0) return
    const winner = pickFrom[Math.floor(Math.random() * pickFrom.length)]
    let ticks = 0
    const totalTicks = 11
    setWinnerId(null)
    const id = setInterval(() => {
      setRouletteId(pickFrom[ticks % pickFrom.length].id)
      ticks++
      if (ticks >= totalTicks) {
        clearInterval(id)
        setRouletteId(winner.id)
        setWinnerId(winner.id)
        setTimeout(() => {
          setRouletteId(null)
          setWinnerId(null)
          setPicked((prev) => [...prev, winner])
          const nextSlot = slotIndex + 1
          setSlotIndex(nextSlot)
          if (nextSlot < k) {
            setPhase(mode === 'permutation' ? 'option' : 'selecting')
          } else {
            setPhase('questions')
          }
        }, 650)
      }
    }, 85)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, slotIndex])

  // --- Combination reveal, two distinct beats ---
  // Beat 1: dividers dissolve and the slots morph into one group (CSS).
  // Beat 2: inside that same group, the chosen items reorder a few times.
  useEffect(() => {
    if (phase !== 'reveal') return
    setRevealed(true)
    const cleanups: Array<() => void> = []
    const morph = setTimeout(() => {
      setReordering(true)
      let count = 0
      const shuffleId = setInterval(() => {
        setPicked((p) => shuffle(p))
        count += 1
        if (count >= 3) {
          clearInterval(shuffleId)
          const settle = setTimeout(() => {
            setReordering(false)
            setQIndex(1)
            setPhase('questions')
          }, 750)
          cleanups.push(() => clearTimeout(settle))
        }
      }, 760)
      cleanups.push(() => clearInterval(shuffleId))
    }, 950)
    cleanups.push(() => clearTimeout(morph))
    return () => cleanups.forEach((fn) => fn())
  }, [phase])

  // FLIP the reorder: translate each item from its old box to the new one, then
  // release the transform so it animates into place.
  useLayoutEffect(() => {
    if (!reordering) return
    const newRects = new Map<string, DOMRect>()
    itemEls.current.forEach((el, id) => newRects.set(id, el.getBoundingClientRect()))
    newRects.forEach((rect, id) => {
      const prev = prevRects.current.get(id)
      const el = itemEls.current.get(id)
      if (!prev || !el) return
      const dx = prev.left - rect.left
      const dy = prev.top - rect.top
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return
      el.style.transition = 'none'
      el.style.transform = `translate(${dx}px, ${dy}px)`
      requestAnimationFrame(() => {
        el.style.transition = 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)'
        el.style.transform = ''
      })
    })
    prevRects.current = newRects
  }, [picked, reordering])

  const showWrong = useCallback((hint: string | undefined, message: string) => {
    setErrorNonce((x) => x + 1)
    setFeedback({ message, variant: 'wrong' })
    if (hint) {
      setTimeout(() => {
        setFeedback((prev) =>
          prev?.variant === 'wrong' ? { message: hint, variant: 'hint' } : prev,
        )
      }, 1600)
    }
  }, [])

  const handleOptionSubmit = (value: number) => {
    const expected = n - slotIndex
    if (value === expected) {
      setFeedback({ message: 'Right.', variant: 'correct' })
      setPhase('selecting')
      setTimeout(() => setFeedback(null), 700)
    } else {
      showWrong(
        'Some are already placed. Count what is left in the pool.',
        resolveFeedback(value, step.optionFeedback),
      )
    }
  }

  const handleQuestionSubmit = (value: number) => {
    const q = step.questions[qIndex]
    if (!q) return
    if (value === q.correctValue) {
      setFeedback({ message: 'Correct!', variant: 'correct' })
      if (mode === 'combination' && qIndex === 0 && !revealed) {
        setTimeout(() => {
          setFeedback(null)
          setPhase('reveal')
        }, 700)
      } else if (qIndex < step.questions.length - 1) {
        setTimeout(() => {
          setQIndex((x) => x + 1)
          setFeedback(null)
        }, 700)
      } else {
        setPhase('done')
        setTimeout(onComplete, 1000)
      }
    } else {
      showWrong(q.hintText, resolveFeedback(value, q.feedbackWrong))
    }
  }

  const treeLevels = slotLabels.map((label, i) => ({ label, branchCount: n - i }))

  return (
    <div className="slot-step">
      <p className="slot-step__prompt">{step.prompt}</p>
      {step.intro && <p className="slot-step__intro">{step.intro}</p>}

      <div className="slot-step__stage">
        {/* Slots / chosen group. Filled cells are keyed by item id so the same
            DOM node persists through the morph and slides during the reorder. */}
        <div className={`slot-row ${revealed ? 'slot-row--group' : ''}`}>
          {revealed && <span className="slot-row__group-tag">Your group of {k}</span>}
          {Array.from({ length: k }).map((_, i) => {
            const item = picked[i]
            const isCurrent = !revealed && i === slotIndex && phase !== 'done'
            if (!item) {
              return (
                <div key={`empty-${i}`} className={`slot ${isCurrent ? 'slot--active' : ''}`}>
                  <span className="slot__label">{slotLabels[i]}</span>
                  <span className="slot__placeholder">?</span>
                </div>
              )
            }
            return (
              <div
                key={item.id}
                ref={setItemEl(item.id)}
                className={`slot slot--filled ${revealed ? 'slot--bare' : ''}`}
              >
                {!revealed && <span className="slot__label">{slotLabels[i]}</span>}
                <span className="slot__item">
                  <span className="slot__emoji">{item.emoji}</span>
                  <span className="slot__name">{item.label}</span>
                </span>
              </div>
            )
          })}
        </div>

        {/* Pool of remaining items */}
        {!revealed && remaining.length > 0 && (
          <div className="pool">
            <span className="pool__caption">
              {phase === 'selecting'
                ? 'Picking…'
                : `${remaining.length} ${step.itemNoun} left`}
            </span>
            <div className="pool__grid">
              {remaining.map((item) => (
                <div
                  key={item.id}
                  className={`pool__item ${rouletteId === item.id ? 'pool__item--spin' : ''} ${
                    winnerId === item.id ? 'pool__item--won' : ''
                  }`}
                >
                  <span className="pool__emoji">{item.emoji}</span>
                  <span className="pool__name">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step.showTree && (
          <div className="slot-step__tree">
            <span className="slot-step__tree-cap">Same idea as your tree</span>
            <TreeBuild allLevels={treeLevels} revealedSplitCount={picked.length} />
          </div>
        )}
      </div>

      {phase === 'reveal' && (
        <p className="slot-step__reveal-note">
          Same {k} {step.itemNoun}, no dividers. Order no longer matters.
        </p>
      )}

      <div className="slot-step__controls">
        {phase === 'option' && (
          <GateInput
            label={`How many ${step.itemNoun} are available for ${slotLabels[slotIndex]}?`}
            onSubmit={handleOptionSubmit}
            errorNonce={errorNonce}
          />
        )}

        {(phase === 'questions' || (mode === 'combination' && qIndex > 0)) && (
          <ol className="slot-step__qledger">
            {step.questions.map((q, i) => {
              const confirmed = i < qIndex
              const active = phase === 'questions' && i === qIndex
              if (!confirmed && !active) return null
              return (
                <li
                  key={q.id}
                  className={`slot-q ${confirmed ? 'is-confirmed' : 'is-active'}`}
                >
                  <span className="slot-q__label">{q.label}</span>
                  {confirmed ? (
                    <span className="slot-q__solved">
                      {q.revealExpression && (
                        <span className="slot-q__expr">{q.revealExpression}</span>
                      )}
                      <span className="slot-q__value">{q.correctValue}</span>
                    </span>
                  ) : (
                    <div className="slot-q__active">
                      <p className="slot-q__prompt">{q.prompt}</p>
                      <GateInput
                        label="Your answer"
                        onSubmit={handleQuestionSubmit}
                        errorNonce={errorNonce}
                      />
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
        )}

        {feedback && <FeedbackBanner message={feedback.message} variant={feedback.variant} />}
      </div>
    </div>
  )
}
