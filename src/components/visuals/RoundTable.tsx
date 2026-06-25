import { useEffect, useRef, useState } from 'react'
import type { SlotItem } from '../../types/lesson'
import './RoundTable.css'

const RADIUS = 86

type Drag = { index: number; x: number; y: number; over: number }

export function RoundTable({
  seats,
  onSolved,
}: {
  seats: SlotItem[]
  onSolved?: () => void
}) {
  const n = seats.length
  const stepAngle = 360 / n
  const [step, setStep] = useState(0)
  const rotationDeg = step * stepAngle
  const looped = step > 0 && step % n === 0

  const [people, setPeople] = useState(seats)
  const [drag, setDrag] = useState<Drag | null>(null)
  // Hint shake plays until the learner has actually grabbed someone.
  const [hasDragged, setHasDragged] = useState(false)

  // Re-sync arrangement if a parent hands us a different roster.
  const prevSeats = useRef(seats)
  if (prevSeats.current !== seats) {
    prevSeats.current = seats
    setPeople(seats)
  }

  const solvedRef = useRef(false)
  useEffect(() => {
    if (looped && !solvedRef.current) {
      solvedRef.current = true
      onSolved?.()
    }
  }, [looped, onSolved])

  // Ring may be rotated, so resolve the seat under a point by hit-testing.
  const seatIndexAt = (x: number, y: number) => {
    const hit = document.elementFromPoint(x, y)
    const seatEl = hit instanceof Element ? hit.closest<HTMLElement>('[data-seat-index]') : null
    return seatEl ? Number(seatEl.dataset.seatIndex) : -1
  }

  const handlePointerDown = (e: React.PointerEvent, index: number) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setHasDragged(true)
    setDrag({ index, x: e.clientX, y: e.clientY, over: -1 })
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    setDrag((d) => {
      if (!d) return d
      const target = seatIndexAt(e.clientX, e.clientY)
      return { ...d, x: e.clientX, y: e.clientY, over: target !== d.index ? target : -1 }
    })
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!drag) return
    const target = seatIndexAt(e.clientX, e.clientY)
    if (target >= 0 && target !== drag.index) {
      setPeople((prev) => {
        const next = prev.slice()
        ;[next[drag.index], next[target]] = [next[target], next[drag.index]]
        return next
      })
    }
    setDrag(null)
  }

  return (
    <div className="round-table">
      <div className="round-table__stage">
        <div
          className="round-table__ring"
          style={{ transform: `rotate(${rotationDeg}deg)` }}
        >
          <span className="round-table__top" />
          {people.map((p, i) => {
            const a = i * stepAngle
            const cls = ['round-table__person']
            if (drag) {
              if (drag.index === i) cls.push('is-lifted')
              else if (drag.over === i) cls.push('is-drop-target')
              else cls.push('is-drop-candidate')
            } else if (!hasDragged) {
              cls.push('is-hint')
            }
            return (
              <div
                key={p.id}
                className="round-table__seat"
                data-seat-index={i}
                style={{ transform: `rotate(${a}deg) translateY(${-RADIUS}px) rotate(${-a}deg)` }}
              >
                <div
                  className={cls.join(' ')}
                  style={{ rotate: `${-rotationDeg}deg` }}
                  onPointerDown={(e) => handlePointerDown(e, i)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                >
                  <span className="round-table__emoji">{p.emoji}</span>
                  <span className="round-table__name">{p.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {drag && (
        <div
          className="round-table__ghost"
          style={{ left: drag.x, top: drag.y }}
          aria-hidden="true"
        >
          <span className="round-table__emoji">{people[drag.index].emoji}</span>
          <span className="round-table__name">{people[drag.index].label}</span>
        </div>
      )}

      <div className="round-table__controls">
        <button
          type="button"
          className="round-table__btn"
          onClick={() => setStep((s) => s + 1)}
        >
          Rotate one seat
        </button>
        <span className={`round-table__count ${looped ? 'is-looped' : ''}`}>
          {looped
            ? `All ${n} rotations look the same`
            : `Rotation ${step % n} of ${n}`}
        </span>
      </div>

      <p className="round-table__note">
        Drag a person onto another to swap seats, or spin: a rotation keeps the
        same neighbors, so it is not a new seating.
      </p>
    </div>
  )
}
