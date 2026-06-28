import { useEffect, useRef, useState } from 'react'
import type { RateLabConfig } from '../../types/lesson'
import './RateLab.css'

/**
 * SN1/E1 rate lab. Dragging the substrate toward 3° raises the ionization-rate
 * bar (carbocation stability), while dragging the nucleophile slider does
 * NOTHING to the bar — so the learner feels that the rate depends on the
 * substrate only (first order). It shows behaviour, never the words "first
 * order"; the gates outside ask for the takeaway.
 */
export function RateLab({
  config,
  onSolved,
}: {
  config: RateLabConfig
  onSolved?: () => void
}) {
  const subs = config.substrates
  const [subIndex, setSubIndex] = useState(0)
  const [nu, setNu] = useState(0.2)
  const sawMaxSub = useRef(false)
  const sawNu = useRef(false)
  const solvedRef = useRef(false)
  const [nuFlash, setNuFlash] = useState(false)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (flashTimer.current) clearTimeout(flashTimer.current)
  }, [])

  const showNu = config.sliders.includes('nucleophile')
  const maxRate = Math.max(...subs.map((s) => s.relRate))
  const current = subs[subIndex]
  const barPct = Math.round((current.relRate / maxRate) * 100)

  const maybeSolve = () => {
    if (solvedRef.current) return
    if (sawMaxSub.current && (!showNu || sawNu.current)) {
      solvedRef.current = true
      setTimeout(() => onSolved?.(), 450)
    }
  }

  const onSubChange = (frac: number) => {
    const i = Math.round(frac * (subs.length - 1))
    setSubIndex(i)
    if (i === subs.length - 1) sawMaxSub.current = true
    if (flashTimer.current) clearTimeout(flashTimer.current)
    setNuFlash(false)
    maybeSolve()
  }

  const onNuChange = (frac: number) => {
    setNu(frac)
    if (frac > 0.5) sawNu.current = true
    // First order: the bar deliberately ignores [Nu], so call out the non-change
    // or learners read the static bar as a broken widget.
    setNuFlash(true)
    if (flashTimer.current) clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setNuFlash(false), 1400)
    maybeSolve()
  }

  return (
    <div className="ratelab">
      <div className="ratelab__chart">
        <div className="ratelab__bar-track">
          <div className="ratelab__bar" style={{ height: `${barPct}%` }} />
        </div>
        <span className="ratelab__bar-label">ionization rate</span>
        <span className={`ratelab__flash ${nuFlash ? 'is-on' : ''}`} aria-live="polite">
          rate unchanged
        </span>
      </div>

      <div className="ratelab__controls">
        <Slider
          label={`Substrate: ${current.label}${current.degree === current.label ? '' : ` (${current.degree})`}`}
          value={subIndex / (subs.length - 1)}
          onChange={onSubChange}
          ticks={subs.length}
        />
        {showNu && (
          <Slider
            label={`Nucleophile concentration: ${Math.round(nu * 100)}%`}
            value={nu}
            onChange={onNuChange}
            accent="flag"
          />
        )}
      </div>

      <p className="ratelab__note">{config.caption ?? 'Drag the sliders and watch the rate.'}</p>
    </div>
  )
}

function Slider({
  label,
  value,
  onChange,
  ticks,
  accent = 'accent',
}: {
  label: string
  value: number
  onChange: (frac: number) => void
  ticks?: number
  accent?: 'accent' | 'flag'
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const setFromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    onChange(frac)
  }

  return (
    <div className="ratelab__slider">
      <span className="ratelab__slider-label">{label}</span>
      <div
        ref={trackRef}
        className={`ratelab__track ratelab__track--${accent}`}
        style={{ touchAction: 'none' }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          dragging.current = true
          setFromClientX(e.clientX)
        }}
        onPointerMove={(e) => {
          if (dragging.current) setFromClientX(e.clientX)
        }}
        onPointerUp={() => {
          dragging.current = false
        }}
      >
        {ticks
          ? Array.from({ length: ticks }).map((_, i) => (
              <span
                key={i}
                className="ratelab__tick"
                style={{ left: `${(i / (ticks - 1)) * 100}%` }}
              />
            ))
          : null}
        <span className="ratelab__thumb" style={{ left: `${value * 100}%` }} />
      </div>
    </div>
  )
}
