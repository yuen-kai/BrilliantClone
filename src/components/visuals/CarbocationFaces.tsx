import { useEffect, useRef, useState } from 'react'
import type { CarbocationFacesConfig } from '../../types/orgo'
import { STAGE, angleDeg, curvedArrowPath, dist, polar, useStagePoint, usePrefersReducedMotion } from './chemKit'
import './CarbocationFaces.css'

const C = { x: 150, y: 150 }
const R = 86
const LG_HOME = { x: 150, y: 56 }
const NU_HOME = { x: 40, y: 150 }
const IONIZE_DIST = 120
const HIT = 38

// sp³ tetrahedral anchors — leaving group points up, the three groups form a
// downward tripod with depth cues (one dash, one wedge).
const SP3 = [
  { x: 90, y: 214 }, // 0 — dash (behind), lower-left
  { x: 150, y: 228 }, // 1 — plain, bottom
  { x: 210, y: 214 }, // 2 — wedge (front), lower-right
]
// sp² trigonal-planar targets, kept off the vertical axis so the p-lobes stay clear.
const SP2 = [240, 120, 0].map((d) => polar(C.x, C.y, R, d))

const TOP = { x: C.x, y: C.y - 52 }
const BOT = { x: C.x, y: C.y + 52 }

type Pt = { x: number; y: number }
type Face = 'top' | 'bottom'

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const mix = (p: Pt, q: Pt, t: number): Pt => ({ x: lerp(p.x, q.x, t), y: lerp(p.y, q.y, t) })

export function CarbocationFaces({
  config,
  onSolved,
}: {
  config: CarbocationFacesConfig
  onSolved: () => void
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const toStage = useStagePoint(svgRef)
  const reduced = usePrefersReducedMotion()

  const [flat, setFlat] = useState(0)
  const [ionized, setIonized] = useState(false)
  const [ready, setReady] = useState(false) // flatten finished — beat B is open
  const [lgPos, setLgPos] = useState<Pt>(LG_HOME)
  const [lgRelease, setLgRelease] = useState<Pt>(LG_HOME)
  const [draggingLg, setDraggingLg] = useState(false)

  const [nuPos, setNuPos] = useState<Pt | null>(null) // set while the Nu is in hand
  const [hoverFace, setHoverFace] = useState<Face | null>(null)
  const [atk, setAtk] = useState(0)
  const [atkFace, setAtkFace] = useState<Face | null>(null)
  const [atkFrom, setAtkFrom] = useState<Pt>(NU_HOME)
  const [hits, setHits] = useState<{ top: number; bottom: number }>({ top: 0, bottom: 0 })
  const [flash, setFlash] = useState<string | null>(null)

  const firedRef = useRef(false)
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

  // ---- Beat A — pull the leaving group off, the carbon flattens to sp² ----
  const ionize = (release: Pt) => {
    setLgRelease(release)
    setIonized(true)
    setDraggingLg(false)
    tween(640, setFlat, () => setReady(true))
  }

  const onLgDown = (e: React.PointerEvent) => {
    if (ionized) return
    e.preventDefault()
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    setFlash(null)
    setDraggingLg(true)
  }

  // ---- Beat B — send the nucleophile to a face ----
  const onNuDown = (e: React.PointerEvent) => {
    if (!ready || atkFace) return
    e.preventDefault()
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    setFlash(null)
    setNuPos(NU_HOME)
  }

  const faceAt = (x: number, y: number): Face | null => {
    if (dist(x, y, TOP.x, TOP.y) <= HIT) return 'top'
    if (dist(x, y, BOT.x, BOT.y) <= HIT) return 'bottom'
    return null
  }

  const onMove = (e: React.PointerEvent) => {
    const p = toStage(e)
    if (draggingLg) {
      setLgPos({ x: Math.max(10, Math.min(290, p.x)), y: Math.max(10, Math.min(290, p.y)) })
    } else if (nuPos) {
      setNuPos(p)
      setHoverFace(faceAt(p.x, p.y))
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
    if (nuPos) {
      const face = faceAt(p.x, p.y)
      setNuPos(null)
      setHoverFace(null)
      if (face) startAttack(face, p)
      else showFlash('Aim for a lobe — the empty p-orbital sits above and below.')
    }
  }

  const startAttack = (face: Face, from: Pt) => {
    setAtkFace(face)
    setAtkFrom(from)
    tween(520, setAtk, () => {
      setHits((h) => ({ ...h, [face]: h[face] + 1 }))
      if (!firedRef.current) {
        firedRef.current = true
        setTimeout(onSolved, 600)
      }
      // Regenerate the cation so the learner can attack the other face too.
      resetTimer.current = setTimeout(() => {
        setAtk(0)
        setAtkFace(null)
      }, 1050)
    })
  }

  // ---- derived geometry ----
  const t = flat
  const gpos = SP3.map((s, i) => {
    const base = mix(s, SP2[i], t)
    const pyr = atkFace ? (atkFace === 'top' ? 1 : -1) * atk * 7 : 0
    return { x: base.x, y: base.y + pyr }
  })
  const lgFly = polar(C.x, C.y, 196, angleDeg(C.x, C.y, lgRelease.x, lgRelease.y))
  const lgCurrent = ionized ? mix(lgRelease, lgFly, t) : lgPos
  const lgOpacity = ionized ? 1 - t : 1
  const plusOpacity = t * (1 - atk)

  const bondEnd = atkFace ? (atkFace === 'top' ? { x: C.x, y: C.y - 44 } : { x: C.x, y: C.y + 44 }) : null
  const nuRest = atkFace ? (atkFace === 'top' ? { x: C.x, y: C.y - 70 } : { x: C.x, y: C.y + 70 }) : null
  const atkNu = atkFace && nuRest ? mix(atkFrom, nuRest, atk) : null
  const newBond = atkFace && bondEnd ? mix(C, bondEnd, atk) : null

  const total = hits.top + hits.bottom
  const topPct = total ? (hits.top / total) * 100 : 50
  const bothFaces = hits.top > 0 && hits.bottom > 0

  const wedgePts = (a: Pt, b: Pt) => {
    const ang = angleDeg(a.x, a.y, b.x, b.y)
    const w1 = polar(b.x, b.y, 6, ang + 90)
    const w2 = polar(b.x, b.y, 6, ang - 90)
    return `${a.x},${a.y} ${w1.x},${w1.y} ${w2.x},${w2.y}`
  }
  const dashTicks = (a: Pt, b: Pt) => {
    const ang = angleDeg(a.x, a.y, b.x, b.y)
    return [0.32, 0.5, 0.68, 0.86].map((f, i) => {
      const c = mix(a, b, f)
      const half = 2 + i * 1.4
      const p1 = polar(c.x, c.y, half, ang + 90)
      const p2 = polar(c.x, c.y, half, ang - 90)
      return { key: i, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }
    })
  }

  const statusEl = flash ? (
    <span className="cf__flash">{flash}</span>
  ) : !ionized ? (
    <span className="cf__note">{config.caption ?? 'Drag the leaving group away — let the carbon ionize on its own.'}</span>
  ) : !ready ? (
    <span className="cf__note">The carbon is collapsing flat…</span>
  ) : atkFace ? (
    <span className="cf__note">A new bond forms on that face.</span>
  ) : firedRef.current ? (
    bothFaces ? (
      <span className="cf__done">Either face works — you get both mirror images.</span>
    ) : (
      <span className="cf__note">Now send it to the other face too.</span>
    )
  ) : (
    <span className="cf__note">An empty p-orbital opens above and below. Send the nucleophile to a face.</span>
  )

  return (
    <div className="cf">
      <svg
        ref={svgRef}
        className="cf__svg"
        viewBox={`0 0 ${STAGE} ${STAGE}`}
        onPointerMove={onMove}
        onPointerUp={onUp}
      >
        <defs>
          <marker id="cf-head" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,1 L8,5 L0,9" className="cf__arrowhead" />
          </marker>
          <marker id="cf-pull-head" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,1 L8,5 L0,9" className="cf__pull-head" />
          </marker>
        </defs>

        {/* empty p-orbital — two faint lobes = the two faces of attack */}
        {ready && !atkFace && (
          <g className="cf__orbital" style={{ opacity: t }}>
            {(['top', 'bottom'] as Face[]).map((f) => {
              const c = f === 'top' ? TOP : BOT
              const armed = !!nuPos
              const hot = hoverFace === f
              return (
                <g key={f} className={`cf__lobe ${armed ? 'is-armed' : ''} ${hot ? 'is-hover' : ''}`}>
                  <ellipse className="cf__lobe-shape" cx={c.x} cy={c.y} rx={14} ry={26} />
                  {armed && <circle className="cf__lobe-ring" cx={c.x} cy={c.y} r={hot ? 30 : 22} />}
                </g>
              )
            })}
          </g>
        )}

        {/* C–LG bond (stretches while dragging, fades as it ionizes) */}
        {lgOpacity > 0.01 && (
          <line className="cf__bond" x1={C.x} y1={C.y} x2={lgCurrent.x} y2={lgCurrent.y} style={{ opacity: lgOpacity }} />
        )}

        {/* C–group bonds */}
        {gpos.map((g, i) => (
          <line key={`b${i}`} className="cf__bond" x1={C.x} y1={C.y} x2={g.x} y2={g.y} />
        ))}

        {/* depth cues that flatten away (dash behind, wedge in front) */}
        {t < 0.999 && (
          <g style={{ opacity: 1 - t }}>
            <polygon className="cf__wedge" points={wedgePts(C, gpos[2])} />
            {dashTicks(C, gpos[0]).map((d) => (
              <line key={`d${d.key}`} className="cf__dash" x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2} />
            ))}
          </g>
        )}

        {/* newly formed C–Nu bond */}
        {newBond && <line className="cf__newbond" x1={C.x} y1={C.y} x2={newBond.x} y2={newBond.y} />}

        {/* attacking nucleophile + its curved arrow */}
        {atkNu && (
          <>
            <path className="cf__arrow" d={curvedArrowPath(atkNu.x, atkNu.y, C.x, C.y, atkFace === 'top' ? 28 : -28)} markerEnd="url(#cf-head)" fill="none" style={{ opacity: atk }} />
            <g className="cf__atom cf__atom--nu">
              <circle className="cf__disc" cx={atkNu.x} cy={atkNu.y} r={14} />
              <text className="cf__label" x={atkNu.x} y={atkNu.y}>
                {config.nucleophile}
              </text>
            </g>
          </>
        )}

        {/* central carbon */}
        <g className="cf__atom cf__atom--carbon">
          <circle className="cf__disc" cx={C.x} cy={C.y} r={16} />
          <text className="cf__label" x={C.x} y={C.y}>
            C
          </text>
          {plusOpacity > 0.01 && (
            <text className="cf__charge cf__charge--pos" x={C.x + 15} y={C.y - 13} style={{ opacity: plusOpacity }}>
              +
            </text>
          )}
        </g>

        {/* substituent groups */}
        {gpos.map((g, i) => (
          <g key={`g${i}`} className="cf__atom cf__atom--group">
            <circle className="cf__disc" cx={g.x} cy={g.y} r={15} />
            <text className="cf__label cf__label--sm" x={g.x} y={g.y}>
              {config.groups[i]}
            </text>
          </g>
        ))}

        {/* leaving group */}
        {lgOpacity > 0.01 && (
          <g
            className={`cf__atom cf__atom--lg ${!ionized ? 'is-grab' : ''} ${draggingLg ? 'is-drag' : ''}`}
            style={{ opacity: lgOpacity }}
            onPointerDown={onLgDown}
          >
            <circle className="cf__disc" cx={lgCurrent.x} cy={lgCurrent.y} r={15} />
            <text className="cf__label cf__label--sm" x={lgCurrent.x} y={lgCurrent.y}>
              {config.leavingGroup}
            </text>
            {ionized && (
              <text className="cf__charge cf__charge--neg" x={lgCurrent.x + 14} y={lgCurrent.y - 12} style={{ opacity: t }}>
                −
              </text>
            )}
          </g>
        )}

        {/* "pull me" affordance before ionization */}
        {!ionized && !draggingLg && (
          <path className="cf__pull" d="M150 38 L150 16" markerEnd="url(#cf-pull-head)" />
        )}

        {/* nucleophile in hand / parked, ready to drag */}
        {ready && !atkFace && (
          <g
            className={`cf__atom cf__atom--nu ${nuPos ? 'is-drag' : 'is-grab'}`}
            onPointerDown={onNuDown}
          >
            <circle className="cf__disc" cx={(nuPos ?? NU_HOME).x} cy={(nuPos ?? NU_HOME).y} r={14} />
            <text className="cf__label cf__label--sm" x={(nuPos ?? NU_HOME).x} y={(nuPos ?? NU_HOME).y}>
              {config.nucleophile}
            </text>
          </g>
        )}
      </svg>

      {total > 0 && (
        <div className="cf__ratio" aria-hidden="true">
          <div className="cf__ratio-bar">
            <div className="cf__ratio-seg cf__ratio-seg--top" style={{ width: `${topPct}%` }}>
              <span className="cf__ratio-tag">▲ {config.nucleophile}</span>
            </div>
            <div className="cf__ratio-seg cf__ratio-seg--bot" style={{ width: `${100 - topPct}%` }}>
              <span className="cf__ratio-tag">▼ {config.nucleophile}</span>
            </div>
          </div>
          <div className="cf__ratio-foot">
            <span>top face</span>
            <span>bottom face</span>
          </div>
        </div>
      )}

      <div className="cf__status" role="status">
        {statusEl}
      </div>
    </div>
  )
}
