import { useEffect, useMemo, useRef, useState } from 'react'
import type { NewmanEliminateConfig } from '../../types/lesson'
import './NewmanEliminate.css'

/**
 * E2 Newman projection. The learner looks down the Cα–Cβ bond and DRAGS the back
 * carbon to rotate it (continuous dihedral). The leaving group is fixed on the
 * front carbon; the base ion sits at the rim, directly opposite it. When a
 * β-hydrogen swings around to point opposite the leaving group, the base can
 * reach it: releasing the drag (or hitting the React button) fires the three
 * E2 arrows at once (base→βH, Cβ–H bond→new π, Cα–LG bond→LG leaves) and snaps
 * to the flat alkene, then reports `onSolved`. Off that one alignment, an
 * attempt to react just bounces. The widget never names the geometry, prints an
 * angle, or shows a verdict — that reasoning is gated outside.
 */

const STAGE = 320
const C = STAGE / 2
const BACK_RING_R = 50
const FRONT_BOND = 56
const FRONT_LABEL_R = 74
const BACK_BOND_OUTER = 102
const BACK_LABEL_R = 116
const BASE_R = 142
const SPIN_HIT_R = 124
const ANTI_DEFAULT = 15
const INITIAL_DIHEDRAL = 30

type Phase = 'idle' | 'firing' | 'done'
type Pt = { x: number; y: number }

const rad = (deg: number) => (deg * Math.PI) / 180
const ptAt = (deg: number, r: number, o: Pt = { x: C, y: C }): Pt => ({
  x: o.x + Math.cos(rad(deg)) * r,
  y: o.y + Math.sin(rad(deg)) * r,
})
// Smallest absolute angular distance, in [0, 180].
const angDist = (a: number, b: number) => Math.abs((((a - b) % 360) + 540) % 360 - 180)

function arrowPath(from: Pt, to: Pt, bowScale = 0.34) {
  const mx = (from.x + to.x) / 2
  const my = (from.y + to.y) / 2
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy) || 1
  const bow = Math.min(42, len * bowScale)
  return `M ${from.x} ${from.y} Q ${mx - (dy / len) * bow} ${my + (dx / len) * bow} ${to.x} ${to.y}`
}

// A concentric "rotate" glyph around the back carbon: a nearly-closed circular
// arc with a tangential arrowhead, so the cue reads as "spin the whole ring" and
// never terminates on a single substituent.
function spinArc(r: number, startDeg: number, sweepDeg: number) {
  const s = ptAt(startDeg, r)
  const e = ptAt(startDeg + sweepDeg, r)
  const largeArc = Math.abs(sweepDeg) > 180 ? 1 : 0
  const sweepFlag = sweepDeg >= 0 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} ${sweepFlag} ${e.x} ${e.y}`
}

export function NewmanEliminate({
  config,
  onSolved,
}: {
  config: NewmanEliminateConfig
  onSolved?: () => void
}) {
  const { front, back, base, leavingGroup } = config
  const antiTol = config.antiToleranceDeg ?? ANTI_DEFAULT

  const svgRef = useRef<SVGSVGElement>(null)
  const [dihedral, setDihedral] = useState(INITIAL_DIHEDRAL)
  const [phase, setPhase] = useState<Phase>('idle')
  const [hasDragged, setHasDragged] = useState(false)
  const [firedBeta, setFiredBeta] = useState(-1)
  const [rejNonce, setRejNonce] = useState(0)
  const [rejecting, setRejecting] = useState(false)

  const dihedralRef = useRef(dihedral)
  const dragRef = useRef<number | null>(null)
  const solvedRef = useRef(false)
  const rejectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Re-sync when a parent reuses this instance for a different step's config.
  const prevConfig = useRef(config)
  if (prevConfig.current !== config) {
    prevConfig.current = config
    dihedralRef.current = INITIAL_DIHEDRAL
    solvedRef.current = false
    setDihedral(INITIAL_DIHEDRAL)
    setPhase('idle')
    setHasDragged(false)
    setFiredBeta(-1)
  }

  useEffect(() => {
    dihedralRef.current = dihedral
  }, [dihedral])

  // Front carbon: fixed Y of substituents; one is the leaving group.
  const frontAngles = useMemo(
    () => front.map((_, i) => -90 + (i * 360) / front.length),
    [front],
  )
  const lgIndex = Math.max(0, front.findIndex((f) => f.lg))
  const lgAngle = frontAngles[lgIndex] ?? -90
  // An anti-periplanar β-H must point exactly opposite the leaving group — which
  // is where the base ion waits at the rim.
  const targetAngle = lgAngle + 180

  const backBase = useMemo(
    () => back.map((_, j) => -90 + (j * 360) / back.length),
    [back],
  )
  const backAngle = (j: number, dih: number) => backBase[j] + dih
  const armedIndexAt = (dih: number) =>
    back.findIndex((s, j) => s.betaH && angDist(backAngle(j, dih), targetAngle) <= antiTol)

  const armedIndex = armedIndexAt(dihedral)
  const armed = armedIndex >= 0 && phase === 'idle'

  const fire = (betaIdx: number) => {
    if (phase !== 'idle' || betaIdx < 0) return
    // Snap to perfect anti at the nearest equivalent angle (no extra spins).
    let want = targetAngle - backBase[betaIdx]
    const cur = dihedralRef.current
    while (want - cur > 180) want -= 360
    while (want - cur < -180) want += 360
    dihedralRef.current = want
    setDihedral(want)
    setFiredBeta(betaIdx)
    setPhase('firing')
  }

  const attemptReact = () => {
    if (phase !== 'idle') return
    const idx = armedIndexAt(dihedralRef.current)
    if (idx >= 0) {
      fire(idx)
      return
    }
    setRejNonce((n) => n + 1)
    setRejecting(true)
    if (rejectTimer.current) clearTimeout(rejectTimer.current)
    rejectTimer.current = setTimeout(() => setRejecting(false), 1500)
  }

  // ---- pointer rotation (mirror RoundTable: pointer capture + spin) ----
  const pointerAngle = (e: React.PointerEvent) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return 0
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    return (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (phase !== 'idle') return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = pointerAngle(e)
    setHasDragged(true)
    setRejecting(false)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragRef.current === null) return
    const a = pointerAngle(e)
    let d = a - dragRef.current
    if (d > 180) d -= 360
    if (d < -180) d += 360
    dragRef.current = a
    // Keep the ref in lockstep so release-to-commit reads the live angle.
    const next = dihedralRef.current + d
    dihedralRef.current = next
    setDihedral(next)
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragRef.current === null) return
    dragRef.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    // Release-to-commit: let go while a β-H is lined up and it fires.
    const idx = armedIndexAt(dihedralRef.current)
    if (idx >= 0) fire(idx)
  }

  useEffect(() => {
    if (phase !== 'firing') return
    const t = setTimeout(() => setPhase('done'), 720)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    if (phase === 'done' && !solvedRef.current) {
      solvedRef.current = true
      const t = setTimeout(() => onSolved?.(), 260)
      return () => clearTimeout(t)
    }
  }, [phase, onSolved])

  useEffect(
    () => () => {
      if (rejectTimer.current) clearTimeout(rejectTimer.current)
    },
    [],
  )

  // ---- geometry ----
  const basePt = ptAt(targetAngle, BASE_R)
  const frontItems = front.map((f, i) => {
    const a = frontAngles[i]
    return { label: f.label, lg: !!f.lg, bondEnd: ptAt(a, FRONT_BOND), labelPt: ptAt(a, FRONT_LABEL_R) }
  })
  const backItems = back.map((s, j) => {
    const a = backAngle(j, dihedral)
    return {
      label: s.label,
      betaH: !!s.betaH,
      rim: ptAt(a, BACK_RING_R),
      bondEnd: ptAt(a, BACK_BOND_OUTER),
      labelPt: ptAt(a, BACK_LABEL_R),
    }
  })

  // A visible grip riding the back-ring rim (in a gap between substituents) so
  // there's a persistent "grab here to rotate" handle; it turns with the ring.
  const gripAngle = (backBase[0] ?? -90) - 180 / Math.max(1, back.length) + dihedral
  const gripPt = ptAt(gripAngle, BACK_RING_R)
  const gr = rad(gripAngle)
  const gux = Math.cos(gr)
  const guy = Math.sin(gr)
  const gtx = -Math.sin(gr)
  const gty = Math.cos(gr)
  const gripTicks = [-3.4, 0, 3.4].map((o) => ({
    x1: gripPt.x + gtx * o - gux * 3.2,
    y1: gripPt.y + gty * o - guy * 3.2,
    x2: gripPt.x + gtx * o + gux * 3.2,
    y2: gripPt.y + gty * o + guy * 3.2,
  }))

  // The three concerted arrows (shown while firing, opposite ends of the bond).
  const reacting = phase !== 'idle'
  const arrows = reacting
    ? [
        arrowPath(ptAt(targetAngle, BASE_R - 8), ptAt(targetAngle, BACK_LABEL_R + 6), 0.25),
        arrowPath(ptAt(targetAngle, BACK_RING_R + 10), ptAt(targetAngle, 14), 0.55),
        arrowPath(ptAt(lgAngle, 30), ptAt(lgAngle, FRONT_LABEL_R + 24), 0.3),
      ]
    : []

  // ---- product (flat alkene) ----
  const caL: Pt = { x: C - 28, y: C }
  const caR: Pt = { x: C + 28, y: C }
  const remFront = front.filter((f) => !f.lg)
  const remBack = back.filter((_, j) => j !== firedBeta)
  const leftAngles = [212, 148]
  const rightAngles = [-32, 32]
  const productGroups = [
    ...remFront.map((f, i) => ({ from: caL, end: ptAt(leftAngles[i] ?? 180, 42, caL), label: f.label })),
    ...remBack.map((s, i) => ({ from: caR, end: ptAt(rightAngles[i] ?? 0, 42, caR), label: s.label })),
  ]
  const lgDrift = ptAt(lgAngle, FRONT_LABEL_R + 44)

  return (
    <div className={`nme phase-${phase}`}>
      <svg
        ref={svgRef}
        className="nme__svg"
        viewBox={`0 0 ${STAGE} ${STAGE}`}
        role="img"
        aria-label="E2 Newman projection: rotate the back carbon to line a hydrogen up with the base"
      >
        <defs>
          <marker
            id="nme-head"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 L3,5 z" className="nme__arrowhead" />
          </marker>
        </defs>

        {/* rotation track + first-time spin hint (a loop around the ring, not an
            arrow that lands on one hydrogen) */}
        <circle className="nme__track" cx={C} cy={C} r={BACK_LABEL_R} />
        {!hasDragged && phase === 'idle' && (
          <path className="nme__spinhint" d={spinArc(BACK_RING_R + 16, -50, 290)} markerEnd="url(#nme-head)" />
        )}

        {/* the Newman projection (fades out as the alkene forms) */}
        <g className="nme__newman">
          {/* back carbon: a ring with bonds emerging from the rim */}
          {backItems.map((b, j) => (
            <line key={`bb-${j}`} className="nme__bond" x1={b.rim.x} y1={b.rim.y} x2={b.bondEnd.x} y2={b.bondEnd.y} />
          ))}
          <circle className="nme__ring" cx={C} cy={C} r={BACK_RING_R} />
          {phase === 'idle' && (
            <g className={`nme__grip ${!hasDragged ? 'is-hint' : ''}`} aria-hidden="true">
              <circle cx={gripPt.x} cy={gripPt.y} r={9} />
              {gripTicks.map((t, i) => (
                <line key={`grip-${i}`} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
              ))}
            </g>
          )}
          {backItems.map((b, j) => (
            <text
              key={`bl-${j}`}
              x={b.labelPt.x}
              y={b.labelPt.y}
              className={`nme__atom ${b.betaH ? 'is-beta' : ''} ${armed && armedIndex === j ? 'is-armed' : ''}`}
            >
              {b.label}
            </text>
          ))}
          {armed && (
            <circle className="nme__beta-ready" cx={backItems[armedIndex].labelPt.x} cy={backItems[armedIndex].labelPt.y} r={16} />
          )}

          {/* front carbon: bonds from the centre + a solid hub on top */}
          {frontItems.map((f, i) => (
            <line key={`fb-${i}`} className="nme__bond" x1={C} y1={C} x2={f.bondEnd.x} y2={f.bondEnd.y} />
          ))}
          <circle className="nme__hub" cx={C} cy={C} r={7} />
          {frontItems.map((f, i) => (
            <text key={`fl-${i}`} x={f.labelPt.x} y={f.labelPt.y} className={`nme__atom ${f.lg ? 'is-lg' : ''}`}>
              {f.label}
            </text>
          ))}

          {/* arrows fire on the committed elimination */}
          {arrows.map((d, i) => (
            <path key={`arrow-${i}`} className="nme__arrow" d={d} markerEnd="url(#nme-head)" />
          ))}
        </g>

        {/* base ion at the rim, opposite the leaving group */}
        <g
          key={`base-${rejNonce}`}
          className={`nme__base ${armed ? 'is-armed' : ''} ${rejNonce > 0 ? 'is-bounce' : ''}`}
          onClick={attemptReact}
        >
          <circle cx={basePt.x} cy={basePt.y} r={17} />
          <text x={basePt.x} y={basePt.y}>{base}</text>
        </g>

        {/* product: the flat alkene + the departing leaving group */}
        <g className="nme__product">
          <line className="nme__pi" x1={caL.x} y1={caL.y - 3} x2={caR.x} y2={caR.y - 3} />
          <line className="nme__pi" x1={caL.x} y1={caL.y + 3} x2={caR.x} y2={caR.y + 3} />
          {productGroups.map((g, i) => (
            <g key={`pg-${i}`}>
              <line className="nme__bond" x1={g.from.x} y1={g.from.y} x2={g.end.x} y2={g.end.y} />
              <text className="nme__atom" x={g.end.x} y={g.end.y}>{g.label}</text>
            </g>
          ))}
          <text className="nme__leaving" x={lgDrift.x} y={lgDrift.y}>{`${leavingGroup}⁻`}</text>
        </g>

        {/* invisible spin handle on top while idle (drag anywhere to rotate) */}
        {phase === 'idle' && (
          <circle
            className="nme__spinner"
            cx={C}
            cy={C}
            r={SPIN_HIT_R}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />
        )}
      </svg>

      <div className="nme__legend" aria-hidden="true">
        <span className="nme__legend-key">β-hydrogen</span>
      </div>

      <div className="nme__controls">
        <button
          type="button"
          className="nme__btn"
          onClick={attemptReact}
          disabled={phase !== 'idle'}
        >
          {phase === 'done' ? 'Eliminated' : `React with ${base}`}
        </button>
      </div>

      <div className="nme__status">
        {rejecting ? (
          <span className="nme__flash">The base can’t reach that hydrogen from here — keep rotating.</span>
        ) : phase === 'done' ? (
          <span className="nme__done">The π bond formed and {leavingGroup}⁻ left.</span>
        ) : armed ? (
          <span className="nme__ready">Lined up — release to eliminate.</span>
        ) : (
          <span className="nme__note">{config.caption ?? 'Drag the back carbon to spin it, then react when a β-hydrogen lines up with the base.'}</span>
        )}
      </div>
    </div>
  )
}
