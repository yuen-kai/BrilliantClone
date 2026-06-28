import { useMemo, useRef, useState } from 'react'
import type { NewmanDialConfig } from '../../types/orgo'
import {
  STAGE,
  angleDeg,
  angleGap,
  curvedArrowPath,
  polar,
  usePrefersReducedMotion,
  useStagePoint,
} from './chemKit'
import './NewmanDial.css'

const C = STAGE / 2
const FRONT_DEG = [-90, 30, 150] // 12, 4, 8 o'clock
const BACK_DEG = [-30, 90, 210] // 2, 6, 10 o'clock
const R_FRONT = 68
const R_BACKC = 40
const R_BACK = 104
const R_BASE = 126
const DEFAULT_TOL = 25

const shortestDelta = (a: number, b: number) => ((a - b + 540) % 360) - 180

export function NewmanDial({
  config,
  onSolved,
}: {
  config: NewmanDialConfig
  onSolved: () => void
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const toStage = useStagePoint(svgRef)
  const reduced = usePrefersReducedMotion()
  const [rotation, setRotation] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)
  const [eliminating, setEliminating] = useState(false)
  const dragRef = useRef<number | null>(null)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fired = useRef(false)

  const tol = config.antiToleranceDeg ?? DEFAULT_TOL

  const lgIndex = useMemo(() => {
    const i = config.front.findIndex((s) => s.lg)
    return i >= 0 ? i : 0
  }, [config.front])
  const lgAngle = FRONT_DEG[lgIndex] ?? -90
  const antiTarget = lgAngle + 180

  const betaIdx = useMemo(
    () => config.back.map((s, i) => (s.betaH ? i : -1)).filter((i) => i >= 0),
    [config.back],
  )

  // The β-H currently closest to anti-periplanar (opposite the leaving group).
  const best = useMemo(() => {
    let index = betaIdx[0] ?? 0
    let gap = 999
    for (const i of betaIdx) {
      const g = angleGap(BACK_DEG[i] + rotation, antiTarget)
      if (g < gap) {
        gap = g
        index = i
      }
    }
    return { index, gap }
  }, [betaIdx, rotation, antiTarget])

  const isAnti = best.gap <= tol
  const overlap = Math.max(0, Math.min(1, (180 - best.gap) / 180))

  const pointerDeg = (e: React.PointerEvent) => {
    const p = toStage(e)
    return angleDeg(C, C, p.x, p.y)
  }

  const onDown = (e: React.PointerEvent) => {
    if (eliminating) return
    e.preventDefault()
    svgRef.current?.setPointerCapture(e.pointerId)
    if (flashTimer.current) clearTimeout(flashTimer.current)
    setFlash(null)
    dragRef.current = pointerDeg(e)
    setDragging(true)
  }

  const onMove = (e: React.PointerEvent) => {
    const prev = dragRef.current
    if (prev === null) return
    const cur = pointerDeg(e)
    dragRef.current = cur
    setRotation((r) => r + shortestDelta(cur, prev))
  }

  const onUp = (e: React.PointerEvent) => {
    if (dragRef.current === null) return
    dragRef.current = null
    setDragging(false)
    svgRef.current?.releasePointerCapture?.(e.pointerId)
  }

  const showFlash = (msg: string) => {
    setFlash(msg)
    if (flashTimer.current) clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlash(null), 2200)
  }

  const eliminate = () => {
    if (eliminating) return
    if (!isAnti) {
      showFlash('Poor orbital overlap — rotate the β-H into line with the leaving group.')
      return
    }
    setFlash(null)
    setEliminating(true)
    if (fired.current) return
    fired.current = true
    setTimeout(onSolved, reduced ? 320 : 1100)
  }

  // --- geometry -----------------------------------------------------------
  const lgPos = polar(C, C, R_FRONT, lgAngle)
  const lgFly = polar(0, 0, 34, lgAngle)
  const basePos = polar(C, C, R_BASE, antiTarget)
  const targetAng = BACK_DEG[best.index] + rotation
  const targetPos = polar(C, C, R_BACK, targetAng)
  const slotPos = polar(C, C, R_BACK, antiTarget)
  const guideInner = polar(C, C, R_BACKC, antiTarget)
  const guideOuter = polar(C, C, R_BASE - 22, antiTarget)
  const baseLabelW = Math.max(34, config.base.length * 8 + 14)

  // concerted curved arrows (base→H, C–H→π, C–LG→LG)
  const arrowBaseToH = curvedArrowPath(basePos.x, basePos.y, targetPos.x, targetPos.y, 24)
  const hInner = polar(C, C, R_BACKC + 4, targetAng)
  const arrowHToPi = curvedArrowPath(hInner.x, hInner.y, C, C, -16)
  const lgInner = polar(C, C, R_FRONT - 24, lgAngle)
  const arrowLgOut = curvedArrowPath(lgInner.x, lgInner.y, lgPos.x, lgPos.y, 18)

  // --- alkene product -----------------------------------------------------
  const CA = { x: 118, y: 150 }
  const CB = { x: 182, y: 150 }
  const frontRest = config.front.filter((_, i) => i !== lgIndex)
  const backRest = config.back.filter((_, i) => i !== best.index)
  const restPos = (origin: { x: number; y: number }, degs: number[]) =>
    degs.map((d) => polar(origin.x, origin.y, 34, d))
  const frontRestPos = restPos(CA, [215, 145])
  const backRestPos = restPos(CB, [-35, 35])

  return (
    <div className={`nd ${eliminating ? 'is-eliminating' : ''} ${reduced ? 'is-reduced' : ''}`}>
      <svg
        ref={svgRef}
        className={`nd__svg ${dragging ? 'is-grabbing' : ''}`}
        viewBox={`0 0 ${STAGE} ${STAGE}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <defs>
          <marker
            id="nd-head"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0,1 L8,5 L0,9" className="nd__arrowhead" />
          </marker>
        </defs>

        <g className="nd__live">
          {/* rotation affordance + anti-periplanar target slot */}
          <circle className="nd__ring" cx={C} cy={C} r={R_BACK + 11} />
          <line
            className={`nd__guide ${isAnti ? 'is-anti' : ''}`}
            x1={guideInner.x}
            y1={guideInner.y}
            x2={guideOuter.x}
            y2={guideOuter.y}
          />
          <circle className={`nd__slot ${isAnti ? 'is-anti' : ''}`} cx={slotPos.x} cy={slotPos.y} r={19} />

          {/* back carbon (rotates) */}
          <circle className="nd__backc" cx={C} cy={C} r={R_BACKC} />
          {config.back.map((s, i) => {
            const deg = BACK_DEG[i] + rotation
            const inner = polar(C, C, R_BACKC, deg)
            const outer = polar(C, C, R_BACK, deg)
            const target = i === best.index && betaIdx.includes(i)
            const leaving = eliminating && i === best.index
            return (
              <g
                key={`b-${i}`}
                className={`nd__atom-grp ${leaving ? 'nd__leaving-h' : ''}`}
                style={
                  leaving
                    ? { transform: `translate(${(basePos.x - outer.x) * 0.45}px, ${(basePos.y - outer.y) * 0.45}px)` }
                    : undefined
                }
              >
                <line
                  className={`nd__bond ${s.betaH ? 'is-betah' : ''} ${target ? 'is-target' : ''} ${target && isAnti ? 'is-anti' : ''}`}
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                />
                <circle
                  className={`nd__atom ${s.betaH ? 'is-betah' : ''} ${target ? 'is-target' : ''} ${target && isAnti ? 'is-anti' : ''}`}
                  cx={outer.x}
                  cy={outer.y}
                  r={15}
                />
                <text className="nd__label" x={outer.x} y={outer.y}>
                  {s.label}
                </text>
              </g>
            )
          })}

          {/* front carbon (fixed) */}
          {config.front.map((s, i) => {
            const deg = FRONT_DEG[i]
            const pos = polar(C, C, R_FRONT, deg)
            const isLg = i === lgIndex
            return (
              <g
                key={`f-${i}`}
                className={`nd__atom-grp ${isLg ? 'nd__lg-grp' : ''}`}
                style={isLg && eliminating ? { transform: `translate(${lgFly.x}px, ${lgFly.y}px)` } : undefined}
              >
                <line
                  className={`nd__bond is-front ${isLg ? 'is-lg' : ''}`}
                  x1={C}
                  y1={C}
                  x2={pos.x}
                  y2={pos.y}
                />
                <circle className={`nd__atom ${isLg ? 'is-lg' : ''}`} cx={pos.x} cy={pos.y} r={15} />
                <text className="nd__label" x={pos.x} y={pos.y}>
                  {s.label}
                </text>
              </g>
            )
          })}
          <circle className="nd__hub" cx={C} cy={C} r={6} />

          {/* concerted arrows fire on elimination */}
          {eliminating && (
            <g className="nd__arrows">
              <path className="nd__arrow" d={arrowBaseToH} markerEnd="url(#nd-head)" fill="none" />
              <path className="nd__arrow" d={arrowHToPi} markerEnd="url(#nd-head)" fill="none" />
              <path className="nd__arrow" d={arrowLgOut} markerEnd="url(#nd-head)" fill="none" />
            </g>
          )}

          {/* base — tap to eliminate (only reacts when anti) */}
          <g
            className={`nd__base ${isAnti ? 'is-anti' : ''}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={eliminate}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && eliminate()}
          >
            <rect
              className="nd__base-pill"
              x={basePos.x - baseLabelW / 2}
              y={basePos.y - 13}
              width={baseLabelW}
              height={26}
              rx={13}
            />
            <text className="nd__base-label" x={basePos.x} y={basePos.y}>
              {config.base}
            </text>
          </g>
        </g>

        {/* product alkene crossfades in */}
        <g className="nd__product" aria-hidden>
          <line className="nd__pi" x1={130} y1={145} x2={170} y2={145} />
          <line className="nd__pi" x1={130} y1={155} x2={170} y2={155} />
          {[
            { c: CA, label: 'C' },
            { c: CB, label: 'C' },
          ].map((n, i) => (
            <g key={`pc-${i}`}>
              <circle className="nd__patom" cx={n.c.x} cy={n.c.y} r={14} />
              <text className="nd__label" x={n.c.x} y={n.c.y}>
                {n.label}
              </text>
            </g>
          ))}
          {frontRest.map((s, i) => {
            const p = frontRestPos[i]
            if (!p) return null
            return (
              <g key={`pf-${i}`}>
                <line className="nd__pbond" x1={CA.x} y1={CA.y} x2={p.x} y2={p.y} />
                <text className="nd__plabel" x={p.x} y={p.y}>
                  {s.label}
                </text>
              </g>
            )
          })}
          {backRest.map((s, i) => {
            const p = backRestPos[i]
            if (!p) return null
            return (
              <g key={`pb-${i}`}>
                <line className="nd__pbond" x1={CB.x} y1={CB.y} x2={p.x} y2={p.y} />
                <text className="nd__plabel" x={p.x} y={p.y}>
                  {s.label}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

      <div className={`nd__meter ${isAnti ? 'is-anti' : ''}`} aria-hidden>
        <span className="nd__meter-label">orbital overlap</span>
        <div className="nd__meter-track">
          <div className="nd__meter-fill" style={{ width: `${overlap * 100}%` }} />
        </div>
      </div>

      <div className="nd__status" role="status">
        {flash ? (
          <span className="nd__flash">{flash}</span>
        ) : eliminating ? (
          <span className="nd__done">Elimination — a new C=C π bond forms.</span>
        ) : (
          <span className="nd__note">
            {config.caption ??
              'Drag to rotate the back carbon. Fill the overlap meter, then tap the base to eliminate.'}
          </span>
        )}
      </div>
    </div>
  )
}
