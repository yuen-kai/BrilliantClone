import { useState } from 'react'
import type { RoundTableVisual } from '../../types/lesson'
import './RoundTable.css'

const RADIUS = 86

export function RoundTable({ seats }: { seats: RoundTableVisual['seats'] }) {
  const n = seats.length
  const stepAngle = 360 / n
  const [step, setStep] = useState(0)
  const rotationDeg = step * stepAngle
  const looped = step > 0 && step % n === 0

  return (
    <div className="round-table">
      <div className="round-table__stage">
        <span className="round-table__head" aria-hidden="true" />
        <div
          className="round-table__ring"
          style={{ transform: `rotate(${rotationDeg}deg)` }}
        >
          <span className="round-table__top" />
          {seats.map((p, i) => {
            const a = i * stepAngle
            return (
              <div
                key={p.id}
                className="round-table__seat"
                style={{ transform: `rotate(${a}deg) translateY(${-RADIUS}px) rotate(${-a}deg)` }}
              >
                <div
                  className="round-table__person"
                  style={{ transform: `rotate(${-rotationDeg}deg)` }}
                >
                  <span className="round-table__emoji">{p.emoji}</span>
                  <span className="round-table__name">{p.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

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
        Spin it: everyone keeps the same neighbors, so a rotation is not a new seating.
      </p>
    </div>
  )
}
