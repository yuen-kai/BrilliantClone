import { useState } from 'react'
import type { ComplementDotsVisual } from '../../types/lesson'
import './ComplementDots.css'

export function ComplementDots({
  total,
  unwanted,
  wantedLabel,
  unwantedLabel,
}: Omit<ComplementDotsVisual, 'component'>) {
  const [removed, setRemoved] = useState(false)

  return (
    <div className="complement">
      <div className="complement__grid" aria-label={`${total} outcomes`}>
        {Array.from({ length: total }).map((_, i) => {
          const isUnwanted = i < unwanted
          const state = isUnwanted ? (removed ? 'is-removed' : 'is-unwanted') : 'is-wanted'
          return <span key={i} className={`complement__dot ${state}`} />
        })}
      </div>

      <button
        type="button"
        className="complement__btn"
        onClick={() => setRemoved((r) => !r)}
      >
        {removed ? 'Bring them back' : `Cross out the ${unwantedLabel}`}
      </button>

      <p className="complement__eq">
        {total} total <span className="complement__minus">−</span> {unwanted} {unwantedLabel}{' '}
        = <strong>{total - unwanted}</strong> {wantedLabel}
      </p>
    </div>
  )
}
