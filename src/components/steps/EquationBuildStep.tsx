import { useRef, useState } from 'react'
import type { EquationBuildStep } from '../../types/lesson'
import { FactorialSplit } from '../visuals/FactorialSplit'
import { FeedbackBanner } from '../lesson/FeedbackBanner'
import './EquationBuildStep.css'

type EquationBuildStepProps = {
  step: EquationBuildStep
  onComplete: () => void
}

type Kind = 'n' | 'k'
type SlotId =
  | 'num'
  | 'denomK'
  | 'denomLeft'
  | 'denomRight'
  | 'sbItems'
  | 'sbGroupsTop'
  | 'sbGroupsBot'
type Slot = { id: SlotId; expects: Kind; hint: string }

// Per-form slot layout, in render/tab order. perm/choose share the numerator (n)
// and the (n − k) denominator; `choose` adds the leading k!. `stars-bars` is a
// different shape — a combination C(items + groups − 1, groups − 1) built from the
// problem's own numbers (n = items, k = groups). Hints nudge the structure without
// ever naming the number, so the answer stays earned.
const SLOTS: Record<EquationBuildStep['form'], Slot[]> = {
  permutation: [
    { id: 'num', expects: 'n', hint: 'The top is the whole pool’s factorial. Which number is the total you pick from?' },
    { id: 'denomLeft', expects: 'n', hint: 'Inside the parentheses you start from the full pool. How big is it?' },
    { id: 'denomRight', expects: 'k', hint: 'You divide away the factors you don’t keep. How many do you actually pick?' },
  ],
  choose: [
    { id: 'num', expects: 'n', hint: 'The top is the whole pool’s factorial. Which number is the total?' },
    { id: 'denomK', expects: 'k', hint: 'First you cancel the orderings of your chosen group. How many did you choose?' },
    { id: 'denomLeft', expects: 'n', hint: 'Inside the parentheses you start from the full pool. How big is it?' },
    { id: 'denomRight', expects: 'k', hint: 'Then you take away the ones you chose. How many was that?' },
  ],
  'stars-bars': [
    { id: 'sbItems', expects: 'n', hint: 'The row’s length starts with the items you’re sharing. Which chip counts the items?' },
    { id: 'sbGroupsTop', expects: 'k', hint: 'Then you add the number of groups. Which chip counts the groups?' },
    { id: 'sbGroupsBot', expects: 'k', hint: 'The dividers are one fewer than the groups. Which chip counts the groups?' },
  ],
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export function EquationBuildStepView({ step, onComplete }: EquationBuildStepProps) {
  const { n, k, form } = step
  const slots = SLOTS[form]
  const [selected, setSelected] = useState<Kind | null>(null)
  const [filled, setFilled] = useState<Record<SlotId, Kind | null>>({
    num: null,
    denomK: null,
    denomLeft: null,
    denomRight: null,
    sbItems: null,
    sbGroupsTop: null,
    sbGroupsBot: null,
  })
  const [hint, setHint] = useState<string | null>(null)
  const [wrongSlot, setWrongSlot] = useState<SlotId | null>(null)
  const slotEls = useRef<Partial<Record<SlotId, HTMLButtonElement | null>>>({})

  // Wrong numbers never stick, so every slot being filled means every slot is right.
  const solved = slots.every((s) => filled[s.id] !== null)
  const valueOf = (kind: Kind) => (kind === 'n' ? n : k)

  const flashWrong = (slotId: SlotId) => {
    setWrongSlot(slotId)
    window.setTimeout(() => setWrongSlot((w) => (w === slotId ? null : w)), 520)
    const el = slotEls.current[slotId]
    // jsdom (unit tests) has no element.animate; guard so the shake is a no-op there.
    if (el && typeof el.animate === 'function' && !prefersReducedMotion()) {
      el.animate(
        [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-5px)' },
          { transform: 'translateX(5px)' },
          { transform: 'translateX(-3px)' },
          { transform: 'translateX(0)' },
        ],
        { duration: 340, easing: 'ease-in-out' },
      )
    }
  }

  const place = (kind: Kind, slotId: SlotId) => {
    const slot = slots.find((s) => s.id === slotId)
    if (!slot) return
    if (slot.expects === kind) {
      setFilled((prev) => ({ ...prev, [slotId]: kind }))
      setHint(null)
      setWrongSlot(null)
    } else {
      flashWrong(slotId)
      setHint(slot.hint)
    }
  }

  const handleSlotClick = (slotId: SlotId) => {
    if (solved) return
    if (filled[slotId] !== null) {
      setFilled((prev) => ({ ...prev, [slotId]: null }))
      setHint(null)
      return
    }
    if (!selected) {
      setHint('Tap a number below, then tap a slot.')
      return
    }
    place(selected, slotId)
  }

  const handleChipClick = (kind: Kind) => {
    setSelected((cur) => (cur === kind ? null : kind))
    setHint(null)
  }

  const renderSlot = (slotId: SlotId) => {
    const kind = filled[slotId]
    const classes = [
      'ebuild__slot',
      kind !== null ? 'is-filled' : 'is-empty',
      solved ? 'is-locked' : '',
      wrongSlot === slotId ? 'is-wrong' : '',
      kind === null && selected && !solved ? 'is-droppable' : '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        type="button"
        ref={(el) => {
          slotEls.current[slotId] = el
        }}
        className={classes}
        onClick={() => handleSlotClick(slotId)}
        onDragOver={(e) => {
          if (!solved && filled[slotId] === null) e.preventDefault()
        }}
        onDrop={(e) => {
          e.preventDefault()
          const dropped = e.dataTransfer.getData('text/plain')
          if (!solved && filled[slotId] === null && (dropped === 'n' || dropped === 'k')) {
            place(dropped, slotId)
          }
        }}
        disabled={solved}
        aria-label={kind !== null ? `Slot holding ${valueOf(kind)}` : 'Empty slot — place a number'}
      >
        {kind !== null ? valueOf(kind) : ''}
      </button>
    )
  }

  const renderChip = (kind: Kind, label: string) => (
    <button
      type="button"
      className={`ebuild__chip ${selected === kind ? 'is-selected' : ''}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', kind)
        e.dataTransfer.effectAllowed = 'move'
        setSelected(kind)
      }}
      onClick={() => handleChipClick(kind)}
      aria-pressed={selected === kind}
    >
      <span className="ebuild__chip-num">{valueOf(kind)}</span>
      <span className="ebuild__chip-label">{label}</span>
    </button>
  )

  return (
    <div className="ebuild">
      <p className="ebuild__prompt">{step.prompt}</p>

      {step.showSplit && (
        <div className="ebuild__visual">
          <FactorialSplit n={n} k={k} />
        </div>
      )}

      <div className={`ebuild__equation ${solved ? 'is-solved' : ''}`}>
        {form === 'stars-bars' ? (
          <span className="ebuild__combo">
            <span className="ebuild__combo-fn">C</span>
            <span className="ebuild__paren">(</span>
            <span className="ebuild__combo-arg">
              {renderSlot('sbItems')}
              <span className="ebuild__op">+</span>
              {renderSlot('sbGroupsTop')}
              <span className="ebuild__op">−</span>
              <span className="ebuild__const">1</span>
            </span>
            <span className="ebuild__comma">,</span>
            <span className="ebuild__combo-arg">
              {renderSlot('sbGroupsBot')}
              <span className="ebuild__op">−</span>
              <span className="ebuild__const">1</span>
            </span>
            <span className="ebuild__paren">)</span>
          </span>
        ) : (
          <>
            <span className="ebuild__lhs">{step.lhs} =</span>
            <span className="ebuild__fraction">
              <span className="ebuild__numer">
                {renderSlot('num')}
                <span className="ebuild__fac">!</span>
              </span>
              <span className="ebuild__bar" aria-hidden="true" />
              <span className="ebuild__denom">
                {form === 'choose' && (
                  <>
                    {renderSlot('denomK')}
                    <span className="ebuild__fac">!</span>
                  </>
                )}
                <span className="ebuild__paren">(</span>
                {renderSlot('denomLeft')}
                <span className="ebuild__op">−</span>
                {renderSlot('denomRight')}
                <span className="ebuild__paren">)</span>
                <span className="ebuild__fac">!</span>
              </span>
            </span>
          </>
        )}
      </div>

      {!solved && (
        <div className="ebuild__palette" role="group" aria-label="Numbers to place">
          {renderChip('n', step.nLabel)}
          {renderChip('k', step.kLabel)}
        </div>
      )}

      {hint && !solved && <FeedbackBanner message={hint} variant="hint" />}

      {solved && (
        <div className="ebuild__finish">
          <p className="ebuild__result">{step.result}</p>
          <p className="ebuild__rule">
            You built it: <strong>{step.ruleName}</strong>
          </p>
          <button type="button" className="ebuild__continue" onClick={onComplete}>
            Continue
          </button>
        </div>
      )}
    </div>
  )
}
