import { useEffect, useRef, useState } from 'react'
import type { ReactionStageConfig } from '../../types/lesson'
import './ReactionStage.css'

const W = 340
const H = 280
const C = { x: 176, y: 132 }
const AXIS = 88 // C–LG distance (and C→open-lobe, the other way)
const GROUP_L = 56 // length of the three substituent bonds
const NU_R = 17
const NU_START = { x: 176, y: 250 }
const ACCEPT_DIST = 100 // a drop must land this close to C to count as an attempt
const LG = { x: C.x + AXIS, y: C.y } // leaving group sits east
const LOBE = { x: C.x - AXIS, y: C.y } // open lobe / approach corridor sits west
const BOND = { x: C.x - GROUP_L, y: C.y } // where the nucleophile ends up bonded
const EJECT = { x: 330, y: 88 } // where the leaving group flies off to
const CONE_LEN = 48 // short approach-hint stubs, kept clear of the substituents

type Pt = { x: number; y: number }
type Phase = 'idle' | 'reacting' | 'done' | 'blocked' | 'failing'

const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)
const easeOut = (t: number) => 1 - (1 - t) ** 2
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y)
// drop a trailing charge glyph once an atom goes neutral on bonding
const stripCharge = (s: string) => s.replace(/[\u207A\u207B\u2212+-]+$/, '')

// Reactant directions of the three substituents (umbrella open toward the west,
// i.e. away from the leaving group). Inversion mirrors x → −x, so each bond
// sweeps through the vertical (planar) transition state to the far side.
const GROUPS = [
  { u: [-0.34, -0.94] as const, style: 'normal' as const },
  { u: [-0.866, 0.5] as const, style: 'wedge' as const },
  { u: [-0.34, 0.94] as const, style: 'dash' as const },
]

function groupAngles(u: readonly [number, number]): [number, number] {
  const a0 = Math.atan2(u[1], u[0])
  let a1 = Math.atan2(u[1], -u[0])
  if (a1 - a0 > Math.PI) a1 -= 2 * Math.PI
  if (a0 - a1 > Math.PI) a1 += 2 * Math.PI
  return [a0, a1]
}
const GA = GROUPS.map((g) => groupAngles(g.u))

// Single-hump energy profile, parameterised by reaction progress t ∈ [0, 1].
const ePoint = (t: number): Pt => ({ x: lerp(36, 304, clamp(t)), y: 92 - 64 * Math.sin(Math.PI * clamp(t)) })
function curve(t0: number, t1: number) {
  const N = 28
  let d = ''
  for (let i = 0; i <= N; i++) {
    const p = ePoint(t0 + ((t1 - t0) * i) / N)
    d += `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`
  }
  return d
}

function Bond({ a, b, style, cls }: { a: Pt; b: Pt; style: 'normal' | 'wedge' | 'dash'; cls?: string }) {
  if (style === 'normal') {
    return <line className={`rxn__bond ${cls ?? ''}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
  }
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  if (style === 'wedge') {
    const w = 5.4
    return (
      <polygon
        className={`rxn__wedge ${cls ?? ''}`}
        points={`${a.x},${a.y} ${b.x + nx * w},${b.y + ny * w} ${b.x - nx * w},${b.y - ny * w}`}
      />
    )
  }
  const hashes = []
  const n = 5
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1)
    const cx = a.x + dx * t
    const cy = a.y + dy * t
    const w = 1.6 + 4.2 * t
    hashes.push(<line key={i} x1={cx + nx * w} y1={cy + ny * w} x2={cx - nx * w} y2={cy - ny * w} />)
  }
  return <g className={`rxn__dash ${cls ?? ''}`}>{hashes}</g>
}

export function ReactionStage({
  config,
  onSolved,
}: {
  config: ReactionStageConfig
  onSolved?: () => void
}) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [inv, setInv] = useState(0)
  const invRef = useRef(0)
  const [nu, setNu] = useState<Pt>(NU_START)
  const nuRef = useRef<Pt>(NU_START)
  const dropRef = useRef<Pt>(NU_START)
  const [drag, setDrag] = useState(false)
  const [hint, setHint] = useState<'cone' | 'bad' | null>(null)
  const [failT, setFailT] = useState(0)
  const [status, setStatus] = useState<string | null>(null)
  const solvedRef = useRef(false)
  const raf = useRef<number | null>(null)
  const nuRaf = useRef<number | null>(null)

  const bulky = config.mode === 'rate' && !!config.bulky
  const tol = ((config.backsideToleranceDeg ?? 40) * Math.PI) / 180

  useEffect(
    () => () => {
      if (raf.current != null) cancelAnimationFrame(raf.current)
      if (nuRaf.current != null) cancelAnimationFrame(nuRaf.current)
    },
    [],
  )

  const setNuPos = (p: Pt) => {
    nuRef.current = p
    setNu(p)
  }

  const solve = () => {
    if (solvedRef.current) return
    solvedRef.current = true
    onSolved?.()
  }

  const toStage = (e: React.PointerEvent): Pt => {
    const r = svgRef.current?.getBoundingClientRect()
    if (!r) return { x: 0, y: 0 }
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H }
  }

  // Within the approach cone if the drop sits within `tol` of due-west of C.
  const angleOK = (p: Pt) => {
    let d = Math.atan2(p.y - C.y, p.x - C.x) - Math.PI
    while (d > Math.PI) d -= 2 * Math.PI
    while (d < -Math.PI) d += 2 * Math.PI
    return Math.abs(d) <= tol
  }

  const animateInv = (to: number, dur: number, done?: () => void) => {
    if (raf.current != null) cancelAnimationFrame(raf.current)
    const from = invRef.current
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / dur)
      const v = from + (to - from) * easeInOut(t)
      invRef.current = v
      setInv(v)
      if (t < 1) raf.current = requestAnimationFrame(tick)
      else {
        raf.current = null
        done?.()
      }
    }
    raf.current = requestAnimationFrame(tick)
  }

  const animateNu = (to: Pt, dur: number, done?: () => void) => {
    if (nuRaf.current != null) cancelAnimationFrame(nuRaf.current)
    const from = { ...nuRef.current }
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / dur)
      const e = easeOut(t)
      setNuPos({ x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e })
      if (t < 1) nuRaf.current = requestAnimationFrame(tick)
      else {
        nuRaf.current = null
        done?.()
      }
    }
    nuRaf.current = requestAnimationFrame(tick)
  }

  const evaluate = (p: Pt) => {
    setNuPos(p)
    if (dist(p, C) > ACCEPT_DIST) {
      animateNu(NU_START, 360) // never committed — drift back quietly
      return
    }
    if (!angleOK(p)) {
      setStatus('Bounced off.')
      animateNu(NU_START, 440)
      return
    }
    if (bulky) {
      setStatus('Too crowded — it won’t go in.')
      setPhase('blocked')
      animateNu(NU_START, 500, solve)
      return
    }
    dropRef.current = p
    setStatus(null)
    setPhase('reacting')
    animateInv(1, 840, () => {
      setPhase('done')
      setStatus('Bond formed.')
      solve()
    })
  }

  const onDown = (e: React.PointerEvent<SVGCircleElement>) => {
    if (phase !== 'idle') return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag(true)
    setStatus(null)
  }
  const onMove = (e: React.PointerEvent<SVGCircleElement>) => {
    if (!drag) return
    const p = toStage(e)
    setNuPos(p)
    setHint(dist(p, C) <= ACCEPT_DIST ? (angleOK(p) ? 'cone' : 'bad') : null)
  }
  const onUp = (e: React.PointerEvent<SVGCircleElement>) => {
    if (!drag) return
    setDrag(false)
    setHint(null)
    evaluate(toStage(e))
  }

  // The "let the group leave first" path: climbs with nothing to settle into,
  // then falls back — no product, no resting point.
  const leaveFirst = () => {
    if (phase !== 'idle') return
    setStatus(null)
    setPhase('failing')
    const up = performance.now()
    const climb = (now: number) => {
      const t = Math.min(1, (now - up) / 520)
      setFailT(t)
      if (t < 1) raf.current = requestAnimationFrame(climb)
      else {
        setStatus('No resting point — it snaps back.')
        const hold = performance.now()
        const back = (n2: number) => {
          const t2 = Math.min(1, (n2 - hold - 280) / 420)
          if (t2 <= 0) {
            raf.current = requestAnimationFrame(back)
            return
          }
          setFailT(1 - t2)
          if (t2 < 1) raf.current = requestAnimationFrame(back)
          else setPhase('idle')
        }
        raf.current = requestAnimationFrame(back)
      }
    }
    raf.current = requestAnimationFrame(climb)
  }

  const reacting = phase === 'reacting'
  const done = phase === 'done'
  const failing = phase === 'failing'
  const settled = reacting || done
  const nuRender = settled ? { x: lerp(dropRef.current.x, BOND.x, inv), y: lerp(dropRef.current.y, BOND.y, inv) } : nu
  const lgT = settled ? inv : failing ? 0.32 * failT : 0
  const lgPos = { x: lerp(LG.x, EJECT.x, lgT), y: lerp(LG.y, EJECT.y, lgT) }
  const lgBondOpacity = settled ? clamp(1 - 1.7 * inv) : 1
  const lgLabelOpacity = clamp(1 - lgT)
  // once the concerted event commits, the nucleophile goes neutral (C–OH) and
  // the leaving group departs as an anion — total charge is conserved either way
  const nuLabel = settled ? stripCharge(config.nucleophile) : config.nucleophile
  const lgLabel = settled ? `${config.leavingGroup}\u207B` : config.leavingGroup

  const lobeCls =
    phase === 'blocked'
      ? 'is-blocked'
      : bulky
        ? 'is-closed'
        : hint === 'cone'
          ? 'is-target'
          : hint === 'bad'
            ? 'is-bad'
            : ''

  const energyProgress = failing ? 0.5 * failT : inv
  const marker = ePoint(energyProgress)

  return (
    <div className={`rxn ${done ? 'is-solved' : ''}`} data-mode={config.mode} data-phase={phase}>
      <svg
        ref={svgRef}
        className="rxn__svg"
        viewBox={`0 0 ${W} ${H}`}
        style={{ touchAction: 'none' }}
        role="img"
        aria-label="Reaction stage"
      >
        {/* reaction axis through the centre */}
        <line className="rxn__axis" x1={LOBE.x - 10} y1={C.y} x2={LG.x + 4} y2={C.y} />

        {/* approach window */}
        {phase === 'idle' &&
          [1, -1].map((s) => {
            const a = Math.PI + s * tol
            return (
              <line
                key={s}
                className={`rxn__cone ${drag ? 'is-dim' : ''}`}
                x1={C.x}
                y1={C.y}
                x2={C.x + CONE_LEN * Math.cos(a)}
                y2={C.y + CONE_LEN * Math.sin(a)}
              />
            )
          })}

        {/* open lobe / steric block */}
        <ellipse className={`rxn__lobe ${lobeCls}`} cx={LOBE.x} cy={LOBE.y} rx={22} ry={15} />

        {/* the three substituents (umbrella that inverts) */}
        {GROUPS.map((g, i) => {
          const ang = lerp(GA[i][0], GA[i][1], inv)
          const end = { x: C.x + GROUP_L * Math.cos(ang), y: C.y + GROUP_L * Math.sin(ang) }
          const lab = { x: C.x + (GROUP_L + 14) * Math.cos(ang), y: C.y + (GROUP_L + 14) * Math.sin(ang) }
          return (
            <g key={i}>
              {bulky && <circle className="rxn__bulk" cx={end.x} cy={end.y} r={15} />}
              <Bond a={C} b={end} style={g.style} />
              <text className="rxn__glabel" x={lab.x} y={lab.y}>
                {config.groups[i]}
              </text>
            </g>
          )
        })}

        {/* C–LG bond + leaving group */}
        <line
          className="rxn__bond rxn__bond--lg"
          x1={C.x}
          y1={C.y}
          x2={lgPos.x}
          y2={lgPos.y}
          style={{ opacity: lgBondOpacity }}
        />
        <g style={{ opacity: lgLabelOpacity }}>
          <circle className="rxn__atom-bg" cx={lgPos.x} cy={lgPos.y} r={13} />
          <text className="rxn__glabel rxn__glabel--lg" x={lgPos.x} y={lgPos.y}>
            {lgLabel}
          </text>
        </g>

        {/* forming Nu–C bond */}
        {settled && (
          <line
            className="rxn__bond rxn__bond--nu"
            x1={C.x}
            y1={C.y}
            x2={nuRender.x}
            y2={nuRender.y}
            style={{ opacity: inv }}
          />
        )}

        {/* rubber band toward the centre while aiming */}
        {drag && <line className="rxn__rubber" x1={nuRender.x} y1={nuRender.y} x2={C.x} y2={C.y} />}

        {/* central carbon */}
        <circle className="rxn__atom-bg" cx={C.x} cy={C.y} r={14} />
        <text className="rxn__c" x={C.x} y={C.y}>
          C{failing && failT > 0.45 ? '\u207A' : ''}
        </text>

        {/* nucleophile */}
        <g className="rxn__nu">
          <circle className="rxn__nu-dot" cx={nuRender.x} cy={nuRender.y} r={NU_R} />
          <text className="rxn__nu-label" x={nuRender.x} y={nuRender.y}>
            {nuLabel}
          </text>
          {phase === 'idle' && (
            <circle
              className="rxn__nu-hit"
              cx={nuRender.x}
              cy={nuRender.y}
              r={NU_R + 8}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
            />
          )}
        </g>
      </svg>

      {config.mode === 'concerted' && (
        <div className="rxn__energy">
          <svg className="rxn__energy-svg" viewBox="0 0 340 116" role="img" aria-label="Energy along the reaction">
            <line className="rxn__axis2" x1={28} y1={20} x2={28} y2={100} />
            <line className="rxn__axis2" x1={28} y1={100} x2={316} y2={100} />
            <path className="rxn__curve" d={curve(0, 1)} />
            {inv > 0 && <path className="rxn__curve rxn__curve--trace" d={curve(0, inv)} />}
            <circle className={`rxn__marker ${failing ? 'is-fail' : ''}`} cx={marker.x} cy={marker.y} r={5.5} />
          </svg>
          <div className="rxn__controls">
            <button type="button" className="rxn__btn" onClick={leaveFirst} disabled={phase !== 'idle'}>
              Let the group leave first
            </button>
          </div>
        </div>
      )}

      <div className="rxn__status">
        {status ? (
          <span className={status === 'Bond formed.' ? 'rxn__done' : 'rxn__flash'}>{status}</span>
        ) : (
          <span className="rxn__note">{config.caption ?? 'Drag the nucleophile in toward the carbon.'}</span>
        )}
      </div>
    </div>
  )
}
