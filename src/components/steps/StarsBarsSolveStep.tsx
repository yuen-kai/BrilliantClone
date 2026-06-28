import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { StarsBarsSolveStep } from '../../types/lesson'
import { choose } from '../../lib/lessonEngine'
import { useEnterKey } from '../../hooks/useEnterKey'
import { GateInput } from '../lesson/GateInput'
import { FeedbackBanner } from '../lesson/FeedbackBanner'
import './StarsBarsSolveStep.css'

type StarsBarsSolveStepProps = {
  step: StarsBarsSolveStep
  onComplete: () => void
}

type Phase = 'stars' | 'bars' | 'slots' | 'boxes' | 'ways' | 'done'
type GateKey = 'stars' | 'bars' | 'slots' | 'ways'

const PHASE_RANK: Record<Phase, number> = {
  stars: 0,
  bars: 1,
  slots: 2,
  boxes: 3,
  ways: 4,
  done: 5,
}
// Where a correct answer for each gate sends the row next.
const NEXT_PHASE: Record<GateKey, Phase> = {
  stars: 'bars',
  bars: 'slots',
  slots: 'boxes',
  ways: 'done',
}

const plural = (noun: string, n: number) => (n === 1 ? noun : `${noun}s`)
const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1))
const permute = (n: number, k: number): number => {
  let p = 1
  for (let i = 0; i < k; i++) p *= n - i
  return p
}

/** Fixed-length row with each bar id at a spread-out slot (null = star), so the
 * row opens as one concrete sharing. In the boxed view a drag swaps a bar id into
 * another slot; in the pre-split "sea of stars" a drag re-inserts the bar id at a
 * new index (the stars shift to fill in). */
function spreadBars(bars: number, total: number): (string | null)[] {
  const arr: (string | null)[] = Array(total).fill(null)
  for (let j = 0; j < bars; j++) {
    let pos = Math.min(total - 1, Math.max(0, Math.round(((j + 1) * total) / (bars + 1))))
    while (arr[pos] != null) pos = (pos + 1) % total
    arr[pos] = `b${j}`
  }
  return arr
}

/** Stars per group (the live sharing), splitting on each bar. */
function distribution(barAt: (string | null)[]): number[] {
  const groups = [0]
  for (const v of barAt) {
    if (v) groups.push(0)
    else groups[groups.length - 1] += 1
  }
  return groups
}

type Gate = {
  key: GateKey
  label: string
  prompt: string
  value: number
  expr: string
  hint: string
  resolveWrong: (answer: number) => string
}

export function StarsBarsSolveStepView({ step, onComplete }: StarsBarsSolveStepProps) {
  const { items, groups, itemNoun, groupNoun } = step
  const bars = groups - 1
  const total = items + bars
  const ways = choose(total, bars)
  const groupNounLower = groupNoun.toLowerCase()

  const gates = useMemo<Record<GateKey, Gate>>(() => {
    const ordered = permute(total, bars)
    const barsFact = factorial(bars)
    return {
      stars: {
        key: 'stars',
        label: 'Stars',
        prompt: `Draw the ${plural(itemNoun, items)} as stars. How many stars?`,
        value: items,
        expr: `one ★ per ${itemNoun}`,
        hint: `Each identical ${itemNoun} is a single star.`,
        resolveWrong: () => `One star per ${itemNoun}: ${items}.`,
      },
      bars: {
        key: 'bars',
        label: 'Bars',
        prompt: `How many bars split the row into ${groups} ${plural(groupNounLower, groups)}?`,
        value: bars,
        expr: `${groups} − 1 = ${bars}`,
        hint: `Picture the ${plural(groupNounLower, groups)} lined up in a row, with a bar in each gap between neighbors. How many gaps are there?`,
        resolveWrong: (a) =>
          a === groups
            ? `${groups} ${plural(groupNounLower, groups)} are split by ${groups} − 1 = ${bars} bars.`
            : `One fewer bar than ${plural(groupNounLower, groups)}: ${groups} − 1 = ${bars}.`,
      },
      slots: {
        key: 'slots',
        label: 'Slots',
        prompt: `How many slots are in the row?`,
        value: total,
        expr: `${items} + ${bars} = ${total}`,
        hint: 'The row is the stars and the bars side by side. How many symbols fill it in total?',
        resolveWrong: (a) =>
          a === items
            ? `That's only the stars. Add the ${bars} dividers: ${items} + ${bars} = ${total}.`
            : a === items + groups
              ? `There are only ${groups} − 1 = ${bars} dividers, not ${groups}. So ${items} + ${bars} = ${total}.`
              : `Count the stars and the bars: ${items} + ${bars} = ${total}.`,
      },
      ways: {
        key: 'ways',
        label: 'Ways to arrange',
        prompt: `Every sharing just chooses which ${bars} of the ${total} boxes hold a bar. How many ways?`,
        value: ways,
        expr: `C(${total}, ${bars}) = ${ways}`,
        hint: `The stars never move, so a sharing is set by where the ${bars} bars sit. In how many ways can you place them among the ${total} boxes?`,
        resolveWrong: (a) =>
          a === ordered
            ? `That's the ordered count ${ordered}. The ${bars} bars are identical, so divide by ${bars}! = ${barsFact}: ${ways}.`
            : `Choose ${bars} of ${total} boxes: C(${total}, ${bars}) = ${ways}.`,
      },
    }
  }, [items, groups, bars, total, ways, itemNoun, groupNounLower])

  const [phase, setPhase] = useState<Phase>(step.scaffold ? 'stars' : 'slots')
  const [barAt, setBarAt] = useState<(string | null)[]>(() => spreadBars(bars, total))
  const [dragId, setDragId] = useState<string | null>(null)
  const [drag, setDrag] = useState({ x: 0, y: 0 })
  const [hover, setHover] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{
    message: string
    variant: 'correct' | 'wrong' | 'hint'
  } | null>(null)
  const [errorNonce, setErrorNonce] = useState(0)

  // Enter advances the "Next →" (when slots are given) and final "Continue".
  const enterAdvance = useCallback(() => {
    if (phase === 'done') onComplete()
    else if (step.slotsGiven && phase === 'slots') setPhase('boxes')
  }, [phase, step.slotsGiven, onComplete])
  useEnterKey(enterAdvance, phase === 'done' || (!!step.slotsGiven && phase === 'slots'))

  const reduceMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  const boxed = phase === 'boxes' || phase === 'ways' || phase === 'done'
  // Drag in every phase except the brief one-time split morph.
  const canDrag = phase !== 'boxes'

  const rowEl = useRef<HTMLDivElement | null>(null)
  const cellEls = useRef<(HTMLElement | null)[]>([])
  const barEls = useRef(new Map<string, HTMLElement>())
  const setBarEl = (id: string) => (el: HTMLElement | null) => {
    if (el) barEls.current.set(id, el)
    else barEls.current.delete(id)
  }
  // Drag geometry, snapshotted on pointer-down so the fixed cells never need to
  // be re-measured mid-gesture (no reflow).
  const grab = useRef({ px: 0, py: 0, from: 0 })
  const centers = useRef<number[]>([])
  const rowRect = useRef<DOMRect | null>(null)
  const flip = useRef<{ id: string; from: DOMRect } | null>(null)

  // Boxed/swap view: the star box the pointer would drop into, and whether that's
  // a legal swap (an empty box that isn't the one we picked up).
  const targetFor = useCallback(
    (cx: number, cy: number) => {
      const r = rowRect.current
      if (r && (cy < r.top - 72 || cy > r.bottom + 72)) {
        return { index: grab.current.from, valid: false }
      }
      let nearest = 0
      let best = Infinity
      centers.current.forEach((c, i) => {
        const d = Math.abs(cx - c)
        if (d < best) {
          best = d
          nearest = i
        }
      })
      return { index: nearest, valid: barAt[nearest] == null && nearest !== grab.current.from }
    },
    [barAt],
  )

  // Sea-of-stars view: the slot index the bar would be inserted at (nearest cell
  // center). Off-row falls back to the original slot so the drop is a no-op.
  const insertIndexFor = useCallback((cx: number, cy: number) => {
    const r = rowRect.current
    if (r && (cy < r.top - 72 || cy > r.bottom + 72)) return grab.current.from
    let nearest = 0
    let best = Infinity
    centers.current.forEach((c, i) => {
      const d = Math.abs(cx - c)
      if (d < best) {
        best = d
        nearest = i
      }
    })
    return nearest
  }, [])

  const onPointerDown = (e: React.PointerEvent<HTMLElement>, posIndex: number) => {
    if (!canDrag) return
    const id = barAt[posIndex]
    if (!id) return
    e.currentTarget.setPointerCapture(e.pointerId)
    grab.current = { px: e.clientX, py: e.clientY, from: posIndex }
    centers.current = cellEls.current.map((el) => {
      const r = el?.getBoundingClientRect()
      return r ? r.left + r.width / 2 : 0
    })
    rowRect.current = rowEl.current?.getBoundingClientRect() ?? null
    setDragId(id)
    setDrag({ x: 0, y: 0 })
    setHover(null)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragId) return
    setDrag({ x: e.clientX - grab.current.px, y: e.clientY - grab.current.py })
    if (boxed) {
      const t = targetFor(e.clientX, e.clientY)
      setHover(t.valid ? t.index : null)
    } else {
      // hover doubles as the live insertion index that opens the gap.
      setHover(insertIndexFor(e.clientX, e.clientY))
    }
  }

  const endDrag = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragId) return
    // Snapshot where the bar floats now (under the finger) so the glide starts
    // there and eases into its landing slot — or back home on a no-op drop.
    const node = barEls.current.get(dragId)
    if (node) flip.current = { id: dragId, from: node.getBoundingClientRect() }
    const next = barAt.slice()
    if (boxed) {
      const { index, valid } = targetFor(e.clientX, e.clientY)
      if (valid) {
        next[index] = dragId
        next[grab.current.from] = null
      }
    } else {
      // Insertion: lift the bar out of its slot and splice it back in at the
      // pointer's index; the intervening stars close up / make room.
      const to = insertIndexFor(e.clientX, e.clientY)
      const from = grab.current.from
      if (to !== from) {
        next.splice(from, 1)
        next.splice(to, 0, dragId)
      }
    }
    setBarAt(next)
    setDragId(null)
    setDrag({ x: 0, y: 0 })
    setHover(null)
  }

  // The moved bar glides from its released spot into its landing slot. In the
  // boxed view the boxes are fixed and displaced stars just appear; in the
  // sea-of-stars view the stars already slid into place during the drag (the gap
  // == the final layout), so only the bar visibly moves. FLIP measures the bar
  // before/after and transitions the inverse to 0.
  useLayoutEffect(() => {
    const f = flip.current
    if (!f) return
    flip.current = null
    const node = barEls.current.get(f.id)
    if (!node) return
    const now = node.getBoundingClientRect()
    const dx = f.from.left - now.left
    const dy = f.from.top - now.top
    if (reduceMotion || (Math.abs(dx) < 1 && Math.abs(dy) < 1)) {
      node.style.transform = ''
      return
    }
    node.style.transition = 'none'
    node.style.transform = `translate(${dx}px, ${dy}px)`
    requestAnimationFrame(() => {
      node.style.transition = 'transform 0.2s cubic-bezier(0.2, 0.7, 0.2, 1)'
      node.style.transform = ''
      const clear = () => {
        node.style.transition = ''
        node.removeEventListener('transitionend', clear)
      }
      node.addEventListener('transitionend', clear)
    })
  }, [barAt, reduceMotion])

  const barStyle = (id: string): React.CSSProperties =>
    dragId === id
      ? { transform: `translate(${drag.x}px, ${drag.y}px) scale(1.12)`, transition: 'none' }
      : {}

  // Sea-of-stars insertion preview: how far the (non-dragged) token in slot `i`
  // slides to open a one-slot gap at the insertion index, with the dragged bar
  // lifted out of `from`. The remaining tokens fill 0..total-1 skipping the gap,
  // so each one's destination is its rank with `from` removed and `to` skipped.
  const slotShift = (i: number): number => {
    if (boxed || dragId == null || hover == null) return 0
    const from = grab.current.from
    if (i === from) return 0
    const rank = i < from ? i : i - 1
    const dest = rank < hover ? rank : rank + 1
    return (centers.current[dest] ?? 0) - (centers.current[i] ?? 0)
  }

  const cellStyle = (i: number): React.CSSProperties => {
    const base = { '--i': i } as React.CSSProperties
    if (boxed || dragId == null || i === grab.current.from) return base
    return {
      ...base,
      transform: `translateX(${slotShift(i)}px)`,
      transition: reduceMotion ? 'none' : 'transform 0.18s cubic-bezier(0.2, 0.7, 0.2, 1)',
    }
  }

  const activeGate: GateKey | null =
    phase === 'stars' || phase === 'bars' || phase === 'slots' || phase === 'ways' ? phase : null

  const gateStatus = (key: GateKey): 'hidden' | 'active' | 'confirmed' => {
    if (phase === key) return 'active'
    return PHASE_RANK[phase] > PHASE_RANK[key] ? 'confirmed' : 'hidden'
  }

  // Show only the hint on a wrong answer — not the explanatory "wrong" text.
  const showWrong = useCallback((hint: string, message: string) => {
    setErrorNonce((n) => n + 1)
    setFeedback(hint ? { message: hint, variant: 'hint' } : { message, variant: 'wrong' })
  }, [])

  const handleSubmit = (value: number) => {
    if (!activeGate) return
    const gate = gates[activeGate]
    if (value !== gate.value) {
      showWrong(gate.hint, gate.resolveWrong(value))
      return
    }
    setFeedback({ message: 'Correct!', variant: 'correct' })
    const next = NEXT_PHASE[activeGate]
    setTimeout(() => {
      setFeedback(null)
      setPhase(next)
    }, 500)
  }

  // Auto-split: the row morphs into one box per symbol, then the final gate is
  // revealed once the stagger has played out. Triggered by a correct "slots"
  // answer (default/scaffold) or by the "Next" button (slots given).
  useEffect(() => {
    if (phase !== 'boxes') return
    const t = setTimeout(() => setPhase('ways'), total * 70 + 400)
    return () => clearTimeout(t)
  }, [phase, total])

  const dist = distribution(barAt)
  const givenCaption = `We've laid out the row: ${items} ${plural(itemNoun, items)} + ${bars} ${plural('divider', bars)} = ${total} slots.`
  // scaffold breaks the setup into stars → bars → slots; otherwise the row's
  // length is a single gate (asked, or given via Next).
  const ledgerKeys: GateKey[] = step.scaffold
    ? ['stars', 'bars', 'slots', 'ways']
    : ['slots', 'ways']

  return (
    <div className="sbsolve">
      <p className="sbsolve__prompt">{step.prompt}</p>

      <div className="sbsolve__stage">
        <div
          ref={rowEl}
          className={`sbsolve__row-tokens ${boxed ? 'is-boxed' : ''} ${dragId ? 'is-dragging' : ''}`}
          aria-label={
            boxed
              ? `${total} boxes, one per symbol`
              : 'One sharing: a sea of stars split by movable bars'
          }
        >
          {Array.from({ length: total }, (_, i) => {
            const id = barAt[i]
            const isBar = id != null
            const className = [
              'sbsolve__cell',
              isBar ? 'sbsolve__cell--bar' : 'sbsolve__cell--star',
              boxed ? 'sbsolve__pos' : '',
              boxed && isBar ? 'sbsolve__pos--bar' : '',
              dragId === id ? 'is-dragging' : '',
              boxed && hover === i ? 'is-drop-target' : '',
            ]
              .filter(Boolean)
              .join(' ')
            const style = cellStyle(i)
            if (isBar) {
              return (
                <button
                  key={`pos-${i}`}
                  type="button"
                  ref={(el) => {
                    cellEls.current[i] = el
                  }}
                  className={className}
                  style={style}
                  onPointerDown={(e) => onPointerDown(e, i)}
                  onPointerMove={onPointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  aria-label="divider"
                >
                  <span ref={setBarEl(id)} className="sbsolve__bartoken" style={barStyle(id)}>
                    <span className="sbsolve__bar" />
                  </span>
                </button>
              )
            }
            return (
              <span
                key={`pos-${i}`}
                ref={(el) => {
                  cellEls.current[i] = el
                }}
                className={className}
                style={style}
              >
                <span className="sbsolve__star">★</span>
              </span>
            )
          })}
        </div>

        <div className="sbsolve__dist">
          {dist.map((c, i) => (
            <span key={i} className="sbsolve__group">
              {groupNoun} {i + 1}
              <strong>{'★'.repeat(c) || '—'}</strong>
            </span>
          ))}
        </div>

        <p className="sbsolve__caption">
          {!boxed && `Drag a divider to re-share the stars among the ${plural(groupNounLower, 2)}.`}
          {phase === 'boxes' && 'Each symbol gets its own box.'}
          {(phase === 'ways' || phase === 'done') &&
            `Each sharing just chooses which ${bars} of the ${total} boxes hold a bar — drag to explore.`}
        </p>
      </div>

      <ol className="sbsolve__ledger" aria-label="Worked solution">
        {ledgerKeys.map((key) => {
          const status = gateStatus(key)
          if (status === 'hidden') return null
          const gate = gates[key]
          const givenSlots = key === 'slots' && !!step.slotsGiven && phase === 'slots'
          return (
            <li
              key={key}
              className={`sbsolve__row ${status === 'confirmed' ? 'is-confirmed' : 'is-current'}`}
            >
              <span className="sbsolve__row-label">{gate.label}</span>
              {status === 'confirmed' ? (
                <span className="sbsolve__row-solved">
                  <span className="sbsolve__expr">{gate.expr}</span>
                  <span className="sbsolve__row-value">{gate.value}</span>
                </span>
              ) : givenSlots ? (
                <div className="sbsolve__row-active sbsolve__row-given">
                  <p className="sbsolve__row-prompt">{givenCaption}</p>
                  <span className="sbsolve__row-solved">
                    <span className="sbsolve__expr">{gate.expr}</span>
                    <span className="sbsolve__row-value">{gate.value}</span>
                  </span>
                  <button
                    type="button"
                    className="sbsolve__next"
                    onClick={() => setPhase('boxes')}
                  >
                    Next →
                  </button>
                </div>
              ) : (
                <div className="sbsolve__row-active">
                  <p className="sbsolve__row-prompt">{gate.prompt}</p>
                  <GateInput label="Your answer" onSubmit={handleSubmit} errorNonce={errorNonce} />
                </div>
              )}
            </li>
          )
        })}
      </ol>

      {feedback && <FeedbackBanner message={feedback.message} variant={feedback.variant} />}

      {phase === 'done' && (
        <div className="sbsolve__finish">
          <p className="sbsolve__result">{ways} ways to share. One combination — nice.</p>
          <button type="button" className="sbsolve__continue" onClick={onComplete}>
            Continue
          </button>
        </div>
      )}
    </div>
  )
}
