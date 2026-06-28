import { useEffect, useMemo, useRef, useState } from 'react'
import type { BetaOption, E1RouteConfig } from '../../types/orgo'
import { STAGE, angleDeg, curvedArrowPath, dist, polar, useStagePoint, usePrefersReducedMotion } from './chemKit'
import './E1Route.css'

const C = { x: 150, y: 150 }
const LG_HOME = { x: 150, y: 54 }
const R_STUB = { x: 150, y: 248 }
const BASE_HOME = { x: 58, y: 250 }
const IONIZE_DIST = 112
const HIT = 36
const BETA_R = 84
const H_RISE = 52

type Pt = { x: number; y: number }
/** A β-carbon and its removable β-H, laid out around the cationic centre. */
type Slot = { opt: BetaOption; c: Pt; h: Pt; mid: Pt; off: Pt }

const clamp = (lo: number, hi: number, v: number) => Math.max(lo, Math.min(hi, v))
const clamp01 = (t: number) => Math.max(0, Math.min(1, t))
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const mix = (p: Pt, q: Pt, t: number): Pt => ({ x: lerp(p.x, q.x, t), y: lerp(p.y, q.y, t) })

// Spread the β-carbons across the upper arc (left → right) so each one's
// removable H sits clear above it and the cation reads as the centre.
function makeSlots(options: BetaOption[]): Slot[] {
  const n = options.length
  return options.map((opt, i) => {
    const deg = n === 1 ? 270 : 215 + (110 * i) / (n - 1)
    const c = polar(C.x, C.y, BETA_R, deg)
    const h = { x: c.x, y: c.y - H_RISE }
    const mid = mix(c, h, 0.5)
    const off = polar(C.x, C.y, 250, angleDeg(C.x, C.y, h.x, h.y))
    return { opt, c, h, mid, off }
  })
}

export function E1Route({ config, onSolved }: { config: E1RouteConfig; onSolved: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const toStage = useStagePoint(svgRef)
  const reduced = usePrefersReducedMotion()
  const slots = useMemo(() => makeSlots(config.betaOptions), [config.betaOptions])
  const maxSub = useMemo(() => Math.max(1, ...config.betaOptions.map((o) => o.substitution)), [config.betaOptions])

  // Beat A — ionization
  const [draggingLg, setDraggingLg] = useState(false)
  const [lgPos, setLgPos] = useState<Pt>(LG_HOME)
  const [lgRelease, setLgRelease] = useState<Pt>(LG_HOME)
  const [ionized, setIonized] = useState(false)
  const [gone, setGone] = useState(0)
  const [ready, setReady] = useState(false)

  // Beat B — β-H removal
  const [basePos, setBasePos] = useState<Pt | null>(null)
  const [hoverBeta, setHoverBeta] = useState<string | null>(null)
  const [active, setActive] = useState<Slot | null>(null)
  const [pluck, setPluck] = useState(0)
  const [dropFrom, setDropFrom] = useState<Pt>(BASE_HOME)
  const [formed, setFormed] = useState<Set<string>>(new Set())
  const [flash, setFlash] = useState<string | null>(null)

  const firedRef = useRef(false)
  const formedRef = useRef<Set<string>>(new Set())
  const anim = useRef<number | null>(null)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (anim.current) cancelAnimationFrame(anim.current)
      if (resetTimer.current) clearTimeout(resetTimer.current)
      if (flashTimer.current) clearTimeout(flashTimer.current)
    },
    [],
  )

  const tween = (ms: number, onUpdate: (t: number) => void, onDone?: () => void) => {
    if (reduced) {
      onUpdate(1)
      onDone?.()
      return
    }
    if (anim.current) cancelAnimationFrame(anim.current)
    const t0 = performance.now()
    const stepFn = (now: number) => {
      const t = Math.min(1, (now - t0) / ms)
      onUpdate(ease(t))
      if (t < 1) anim.current = requestAnimationFrame(stepFn)
      else {
        anim.current = null
        onDone?.()
      }
    }
    anim.current = requestAnimationFrame(stepFn)
  }

  const showFlash = (msg: string) => {
    setFlash(msg)
    if (flashTimer.current) clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlash(null), 2200)
  }

  // ---- Beat A — pull the leaving group off → carbocation ----
  const onLgDown = (e: React.PointerEvent) => {
    if (ionized) return
    e.preventDefault()
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    setFlash(null)
    setDraggingLg(true)
  }

  const ionize = (release: Pt) => {
    setLgRelease(release)
    setIonized(true)
    setDraggingLg(false)
    tween(620, setGone, () => setReady(true))
  }

  // ---- Beat B — bring the base to a β-H → alkene ----
  const onBaseDown = (e: React.PointerEvent) => {
    if (!ready || active) return
    e.preventDefault()
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    setFlash(null)
    setBasePos(BASE_HOME)
  }

  const betaAt = (x: number, y: number): Slot | null => {
    let best: Slot | null = null
    let bestD = HIT
    for (const s of slots) {
      const d = dist(x, y, s.h.x, s.h.y)
      if (d <= bestD) {
        best = s
        bestD = d
      }
    }
    return best
  }

  const onMove = (e: React.PointerEvent) => {
    const p = toStage(e)
    if (draggingLg) {
      setLgPos({ x: clamp(10, 290, p.x), y: clamp(10, 290, p.y) })
    } else if (basePos) {
      setBasePos(p)
      setHoverBeta(betaAt(p.x, p.y)?.opt.id ?? null)
    }
  }

  const onUp = (e: React.PointerEvent) => {
    const p = toStage(e)
    if (draggingLg) {
      setDraggingLg(false)
      if (dist(p.x, p.y, C.x, C.y) >= IONIZE_DIST) ionize(p)
      else {
        setLgPos(LG_HOME)
        showFlash('Pull the leaving group right off the carbon.')
      }
      return
    }
    if (basePos) {
      const hit = betaAt(p.x, p.y)
      setHoverBeta(null)
      if (hit) startPluck(hit, p)
      else {
        setBasePos(null)
        showFlash('Bring the base to a β-hydrogen — an H on a carbon next to the +.')
      }
    }
  }

  const startPluck = (slot: Slot, from: Pt) => {
    setActive(slot)
    setDropFrom(from)
    setBasePos(null)
    tween(820, setPluck, () => {
      const next = new Set(formedRef.current)
      next.add(slot.opt.id)
      formedRef.current = next
      setFormed(next)
      if (!firedRef.current) {
        firedRef.current = true
        setTimeout(onSolved, 600)
      }
      // Regenerate the cation so the other β-H can be tried — unless every
      // option has been formed, in which case the final alkene stays on screen.
      if (next.size < config.betaOptions.length) {
        resetTimer.current = setTimeout(() => {
          setActive(null)
          setPluck(0)
        }, 1100)
      }
    })
  }

  // ---- derived geometry ----
  const aApproach = ease(clamp01(pluck / 0.45))
  const bLeave = ease(clamp01((pluck - 0.45) / 0.55))
  const lgFly = polar(C.x, C.y, 210, angleDeg(C.x, C.y, lgRelease.x, lgRelease.y))
  const lgCurrent = ionized ? mix(lgRelease, lgFly, gone) : lgPos
  const lgOpacity = ionized ? 1 - gone : 1
  const plusOpacity = gone * (active ? 1 - bLeave : 1)
  const basePt = active
    ? bLeave > 0
      ? mix(active.h, active.off, bLeave)
      : mix(dropFrom, active.h, aApproach)
    : (basePos ?? BASE_HOME)

  const allFormed = formed.size >= config.betaOptions.length

  const perp = (a: Pt, b: Pt, d: number) => {
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy) || 1
    return { x: (-dy / len) * d, y: (dx / len) * d }
  }

  const statusEl = flash ? (
    <span className="e1__flash">{flash}</span>
  ) : !ionized ? (
    <span className="e1__note">{config.caption ?? 'Drag the leaving group off — let the carbon ionize on its own.'}</span>
  ) : !ready ? (
    <span className="e1__note">The bond is breaking…</span>
  ) : active ? (
    <span className="e1__note">A β-hydrogen leaves and a double bond forms.</span>
  ) : firedRef.current ? (
    allFormed ? (
      <span className="e1__done">Two β-hydrogens, two different alkenes — compare their stability.</span>
    ) : (
      <span className="e1__note">Now pluck the other β-hydrogen and compare.</span>
    )
  ) : (
    <span className="e1__note">A weak base can grab a β-hydrogen now. Drag the base to one.</span>
  )

  return (
    <div className="e1">
      <svg
        ref={svgRef}
        className="e1__svg"
        viewBox={`0 0 ${STAGE} ${STAGE}`}
        onPointerMove={onMove}
        onPointerUp={onUp}
      >
        <defs>
          <marker id="e1-head" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,1 L8,5 L0,9" className="e1__arrowhead" />
          </marker>
          <marker id="e1-pull-head" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,1 L8,5 L0,9" className="e1__pull-head" />
          </marker>
        </defs>

        {/* skeleton bonds: Cα to its substituents */}
        <line className="e1__bond" x1={C.x} y1={C.y} x2={R_STUB.x} y2={R_STUB.y} />
        {slots.map((s) => {
          const breaking = active?.opt.id === s.opt.id
          return (
            <g key={`bonds-${s.opt.id}`}>
              <line className="e1__bond" x1={C.x} y1={C.y} x2={s.c.x} y2={s.c.y} />
              {/* C–H bond, fades on the chosen β-carbon as the H is removed */}
              {!(breaking && bLeave > 0) && (
                <line className="e1__bond" x1={s.c.x} y1={s.c.y} x2={s.h.x} y2={s.h.y} style={breaking ? { opacity: 1 - bLeave } : undefined} />
              )}
            </g>
          )
        })}

        {/* C–LG bond (fades as it ionizes) */}
        {lgOpacity > 0.01 && <line className="e1__bond" x1={C.x} y1={C.y} x2={lgCurrent.x} y2={lgCurrent.y} style={{ opacity: lgOpacity }} />}

        {/* new π bond (the alkene) for the chosen β-carbon */}
        {active &&
          bLeave > 0.01 &&
          (() => {
            const o = perp(C, active.c, 4)
            return <line className="e1__pi" x1={C.x + o.x} y1={C.y + o.y} x2={active.c.x + o.x} y2={active.c.y + o.y} style={{ opacity: bLeave }} />
          })()}

        {/* "pull me" affordance before ionization */}
        {!ionized && !draggingLg && <path className="e1__pull" d={`M${LG_HOME.x} ${LG_HOME.y - 16} L${LG_HOME.x} ${LG_HOME.y - 38}`} markerEnd="url(#e1-pull-head)" />}

        {/* β-H drop targets */}
        {ready && !active &&
          slots.map((s) => {
            const hot = hoverBeta === s.opt.id
            return (
              <g key={`tar-${s.opt.id}`} className={`e1__htar ${basePos ? 'is-armed' : ''} ${hot ? 'is-hover' : ''}`}>
                <circle cx={s.h.x} cy={s.h.y} r={hot ? 22 : 16} />
              </g>
            )
          })}

        {/* R stub (inert third substituent) */}
        <g className="e1__atom e1__atom--r">
          <circle className="e1__disc e1__disc--sm" cx={R_STUB.x} cy={R_STUB.y} r={13} />
          <text className="e1__label e1__label--sm" x={R_STUB.x} y={R_STUB.y}>R</text>
        </g>

        {/* β-carbons + their removable H's */}
        {slots.map((s) => {
          const breaking = active?.opt.id === s.opt.id
          const hideH = breaking && bLeave > 0
          return (
            <g key={`beta-${s.opt.id}`}>
              <g className="e1__atom e1__atom--beta">
                <circle className="e1__disc" cx={s.c.x} cy={s.c.y} r={15} />
                <text className="e1__label" x={s.c.x} y={s.c.y}>C</text>
                <text className="e1__beta-label" x={s.c.x} y={s.c.y + 27}>{s.opt.label}</text>
              </g>
              {!hideH && (
                <g className={`e1__atom e1__atom--h ${ready && !active ? 'is-live' : ''}`}>
                  <circle className="e1__disc e1__disc--h" cx={s.h.x} cy={s.h.y} r={10} />
                  <text className="e1__label e1__label--sm" x={s.h.x} y={s.h.y}>H</text>
                </g>
              )}
            </g>
          )
        })}

        {/* central carbon → carbocation */}
        <g className={`e1__atom e1__atom--carbon ${ionized ? 'is-cation' : ''}`}>
          <circle className="e1__disc" cx={C.x} cy={C.y} r={16} />
          <text className="e1__label" x={C.x} y={C.y}>C</text>
          {plusOpacity > 0.01 && (
            <text className="e1__charge e1__charge--pos" x={C.x + 15} y={C.y - 13} style={{ opacity: plusOpacity }}>+</text>
          )}
        </g>

        {/* curved arrow: the C–H electrons become the new π bond */}
        {active && bLeave > 0.01 && (
          <path
            className="e1__arrow"
            d={curvedArrowPath(active.mid.x, active.mid.y, C.x, C.y, active.c.x < C.x ? 26 : -26)}
            markerEnd="url(#e1-head)"
            fill="none"
            style={{ opacity: bLeave }}
          />
        )}

        {/* leaving group */}
        {lgOpacity > 0.01 && (
          <g
            className={`e1__atom e1__atom--lg ${!ionized ? 'is-grab' : ''} ${draggingLg ? 'is-drag' : ''}`}
            style={{ opacity: lgOpacity }}
            onPointerDown={onLgDown}
          >
            <circle className="e1__disc e1__disc--sm" cx={lgCurrent.x} cy={lgCurrent.y} r={14} />
            <text className="e1__label e1__label--sm" x={lgCurrent.x} y={lgCurrent.y}>{config.leavingGroup}</text>
            {ionized && (
              <text className="e1__charge e1__charge--neg" x={lgCurrent.x + 13} y={lgCurrent.y - 11} style={{ opacity: gone }}>−</text>
            )}
          </g>
        )}

        {/* base — drag it to a β-H once the cation has formed */}
        {ready && (
          <g
            className={`e1__atom e1__atom--base ${basePos ? 'is-drag' : active ? '' : 'is-grab'}`}
            onPointerDown={onBaseDown}
          >
            <circle className="e1__disc e1__disc--sm" cx={basePt.x} cy={basePt.y} r={13} />
            <text className="e1__label e1__label--sm" x={basePt.x} y={basePt.y}>{config.base}</text>
          </g>
        )}
      </svg>

      {formed.size > 0 && (
        <div className="e1__bars" aria-hidden="true">
          <span className="e1__bars-axis">more stable ▲</span>
          <div className="e1__bars-row">
            {config.betaOptions.map((o) => {
              const shown = formed.has(o.id)
              const hot = active?.opt.id === o.id || hoverBeta === o.id
              return (
                <div key={o.id} className={`e1__bar-col ${hot ? 'is-hot' : ''}`}>
                  <div className="e1__bar-track">
                    {shown && <div className="e1__bar" style={{ height: `${(o.substitution / maxSub) * 100}%` }} />}
                  </div>
                  <span className="e1__bar-label">{o.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="e1__status" role="status">
        {statusEl}
      </div>
    </div>
  )
}
