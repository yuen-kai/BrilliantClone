import { useEffect, useMemo, useRef, useState } from 'react'
import type { BacksideAttackConfig } from '../../types/orgo'
import {
  STAGE,
  angleDeg,
  angleGap,
  dist,
  polar,
  useStagePoint,
  usePrefersReducedMotion,
} from './chemKit'
import './BacksideAttack.css'

type Pt = { x: number; y: number }
type Phase = 'idle' | 'reacting' | 'done'

// Geometry in the 0…STAGE square. LG sits east; the backside corridor (where the
// nucleophile must come in) is due west, 180° from the C–LG axis.
const C: Pt = { x: 150, y: 150 }
const AXIS = 80 // C–LG distance
const GROUP_L = 50 // substituent bond length
const NU_R = 15
const NU_START: Pt = { x: 150, y: 262 }
const LG: Pt = { x: C.x + AXIS, y: C.y }
const LOBE: Pt = { x: C.x - AXIS, y: C.y } // backside opening marker
const BOND: Pt = { x: C.x - 56, y: C.y } // where the Nu ends up bonded
const EJECT: Pt = { x: 292, y: 58 } // where the leaving group flies off
const NU_PARK: Pt = { x: C.x - AXIS - 4, y: C.y } // static Nu spot in sterics mode
const ACCEPT_DIST = 98 // a release this close to C counts as an attempt
const LG_ANGLE = angleDeg(C.x, C.y, LG.x, LG.y) // 0 (east)
const BACKSIDE_ANGLE = (LG_ANGLE + 180) % 360 // 180 (west)

const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const lerpPt = (a: Pt, b: Pt, t: number): Pt => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) })
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)
const easeOut = (t: number) => 1 - (1 - t) ** 2

// Reactant directions of the three substituents — an umbrella opening west (the
// Nu's side). Inversion mirrors x → −x, so each rib sweeps through the vertical
// (planar) transition state and ends up opening east, toward where the LG left.
const GROUPS: ReadonlyArray<readonly [number, number]> = [
  [-0.34, -0.94],
  [-0.96, 0.28],
  [-0.34, 0.94],
]
function groupAngles([ux, uy]: readonly [number, number]): [number, number] {
  const a0 = Math.atan2(uy, ux)
  let a1 = Math.atan2(uy, -ux)
  if (a1 - a0 > Math.PI) a1 -= 2 * Math.PI
  if (a0 - a1 > Math.PI) a1 += 2 * Math.PI
  return [a0, a1]
}
const GA = GROUPS.map(groupAngles)

export function BacksideAttack({
  config,
  onSolved,
}: {
  config: BacksideAttackConfig
  onSolved: () => void
}) {
  const classes = useMemo(() => config.classes ?? [], [config.classes])
  const sterics = classes.length > 0
  const tolDeg = config.backsideToleranceDeg ?? 45

  const svgRef = useRef<SVGSVGElement>(null)
  const toStage = useStagePoint(svgRef)
  const reduced = usePrefersReducedMotion()

  const [phase, setPhase] = useState<Phase>('idle')
  const [nu, setNu] = useState<Pt>(NU_START)
  const [drag, setDrag] = useState(false)
  const [aim, setAim] = useState<'cone' | 'bad' | null>(null)
  const [inv, setInv] = useState(0)
  const [flash, setFlash] = useState<string | null>(null)

  const nuRef = useRef<Pt>(NU_START)
  const invRef = useRef(0)
  const dropRef = useRef<Pt>(NU_START)
  const solvedRef = useRef(false)
  const rafInv = useRef<number | null>(null)
  const rafNu = useRef<number | null>(null)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Rank the substrate classes by rate so bulk + bar length are derived, never
  // hard-coded: fastest = least bulky = longest bar.
  const ranked = useMemo(() => {
    if (classes.length === 0) return null
    const sorted = [...classes].sort((a, b) => b.relRate - a.relRate)
    const maxRel = Math.max(...classes.map((c) => c.relRate), 0)
    const maxRank = Math.max(1, sorted.length - 1)
    const rank = new Map(sorted.map((c, i) => [c.id as string, i]))
    return {
      fastestId: sorted[0].id as string,
      slowestId: sorted[sorted.length - 1].id as string,
      rateFrac: (id: string) =>
        maxRel > 0 ? (classes.find((c) => c.id === id)?.relRate ?? 0) / maxRel : 0,
      bulkFactor: (id: string) => (rank.get(id) ?? 0) / maxRank,
    }
  }, [classes])

  const [selected, setSelected] = useState<string>(ranked?.fastestId ?? '')
  const [explored, setExplored] = useState<Set<string>>(
    () => new Set(ranked ? [ranked.fastestId] : []),
  )

  useEffect(
    () => () => {
      if (rafInv.current != null) cancelAnimationFrame(rafInv.current)
      if (rafNu.current != null) cancelAnimationFrame(rafNu.current)
      if (flashTimer.current) clearTimeout(flashTimer.current)
    },
    [],
  )

  // Fire onSolved once the learner has compared the bulkiest carbon against a
  // faster one — the "watch the rate fall as sterics rise" beat.
  useEffect(() => {
    if (!sterics || !ranked || solvedRef.current) return
    const enough =
      classes.length < 2 ? explored.size >= 1 : explored.has(ranked.slowestId) && explored.size >= 2
    if (enough) {
      solvedRef.current = true
      onSolved()
    }
  }, [explored, sterics, ranked, classes.length, onSolved])

  const setNuPos = (p: Pt) => {
    nuRef.current = p
    setNu(p)
  }

  const showFlash = (msg: string) => {
    setFlash(msg)
    if (flashTimer.current) clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlash(null), 2000)
  }

  const runAnim = (
    ref: React.MutableRefObject<number | null>,
    dur: number,
    onFrame: (t: number) => void,
    onDone?: () => void,
  ) => {
    if (reduced) {
      onFrame(1)
      onDone?.()
      return
    }
    if (ref.current != null) cancelAnimationFrame(ref.current)
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / dur)
      onFrame(t)
      if (t < 1) ref.current = requestAnimationFrame(tick)
      else {
        ref.current = null
        onDone?.()
      }
    }
    ref.current = requestAnimationFrame(tick)
  }

  const driftBack = () => {
    const from = { ...nuRef.current }
    runAnim(
      rafNu,
      360,
      (t) => setNuPos(lerpPt(from, NU_START, easeOut(t))),
      () => setAim(null),
    )
  }

  const react = (p: Pt) => {
    dropRef.current = p
    setFlash(null)
    setPhase('reacting')
    runAnim(
      rafInv,
      900,
      (t) => {
        const v = easeInOut(t)
        invRef.current = v
        setInv(v)
      },
      () => {
        setPhase('done')
        if (!solvedRef.current) {
          solvedRef.current = true
          onSolved()
        }
      },
    )
  }

  const evaluate = (p: Pt) => {
    setNuPos(p)
    if (dist(p.x, p.y, C.x, C.y) > ACCEPT_DIST) {
      driftBack()
      return
    }
    const inCone = angleGap(angleDeg(C.x, C.y, p.x, p.y), BACKSIDE_ANGLE) <= tolDeg
    if (!inCone) {
      showFlash('Blocked — the leaving group is in the way.')
      driftBack()
      return
    }
    react(p)
  }

  const onNuDown = (e: React.PointerEvent) => {
    if (sterics || phase !== 'idle') return
    e.preventDefault()
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    setDrag(true)
    setFlash(null)
    setAim(null)
  }

  const onSvgMove = (e: React.PointerEvent) => {
    if (!drag) return
    const p = toStage(e)
    setNuPos(p)
    if (dist(p.x, p.y, C.x, C.y) <= ACCEPT_DIST) {
      const inCone = angleGap(angleDeg(C.x, C.y, p.x, p.y), BACKSIDE_ANGLE) <= tolDeg
      setAim(inCone ? 'cone' : 'bad')
    } else {
      setAim(null)
    }
  }

  const onSvgUp = (e: React.PointerEvent) => {
    if (!drag) return
    setDrag(false)
    setAim(null)
    evaluate(toStage(e))
  }

  const selectClass = (id: string) => {
    setSelected(id)
    setExplored((prev) => new Set(prev).add(id))
  }

  // ---- derived render values ----
  const settled = phase === 'reacting' || phase === 'done'
  const nuPos = settled ? lerpPt(dropRef.current, BOND, inv) : sterics ? NU_PARK : nu
  const lgT = settled ? inv : 0
  const lgPos = lerpPt(LG, EJECT, lgT)
  const lgBondOpacity = settled ? clamp(1 - 1.7 * inv) : 1
  const lgLabelOpacity = clamp(1 - lgT)

  const curBulk = ranked ? ranked.bulkFactor(selected) : 0
  const blocked = ranked ? ranked.rateFrac(selected) <= 0 : false
  const showGuides = (!sterics && phase === 'idle') || sterics
  const visTol = sterics ? Math.max(8, tolDeg * (1 - 0.6 * curBulk)) : tolDeg
  const lobeRX = sterics ? Math.max(5, 20 * (1 - 0.7 * curBulk)) : 20
  const lobeRY = sterics ? Math.max(4, 14 * (1 - 0.6 * curBulk)) : 14
  const lobeCls = sterics
    ? blocked
      ? 'is-closed'
      : ''
    : aim === 'cone'
      ? 'is-target'
      : aim === 'bad'
        ? 'is-bad'
        : ''
  const groupR = 8 + curBulk * 13

  return (
    <div className={`bsa ${phase === 'done' ? 'is-solved' : ''}`} data-phase={phase}>
      <svg
        ref={svgRef}
        className="bsa__svg"
        viewBox={`0 0 ${STAGE} ${STAGE}`}
        role="img"
        aria-label="SN2 backside attack"
        onPointerMove={onSvgMove}
        onPointerUp={onSvgUp}
      >
        {/* reaction axis */}
        <line className="bsa__axis" x1={C.x - AXIS - 8} y1={C.y} x2={C.x + AXIS + 6} y2={C.y} />

        {/* backside approach cone + opening */}
        {showGuides &&
          [1, -1].map((s) => {
            const p = polar(C.x, C.y, AXIS + 14, BACKSIDE_ANGLE + s * visTol)
            return <line key={s} className="bsa__cone" x1={C.x} y1={C.y} x2={p.x} y2={p.y} />
          })}
        {showGuides && (
          <ellipse className={`bsa__lobe ${lobeCls}`} cx={LOBE.x} cy={LOBE.y} rx={lobeRX} ry={lobeRY} />
        )}

        {/* the three substituents — the umbrella that inverts */}
        {GROUPS.map((_, i) => {
          const ang = lerp(GA[i][0], GA[i][1], inv)
          const end = { x: C.x + GROUP_L * Math.cos(ang), y: C.y + GROUP_L * Math.sin(ang) }
          const lab = { x: C.x + (GROUP_L + 13) * Math.cos(ang), y: C.y + (GROUP_L + 13) * Math.sin(ang) }
          return (
            <g key={i}>
              <line className="bsa__bond" x1={C.x} y1={C.y} x2={end.x} y2={end.y} />
              <circle className={sterics ? 'bsa__bulk' : 'bsa__group'} cx={end.x} cy={end.y} r={groupR} />
              {!sterics && (
                <text className="bsa__glabel" x={lab.x} y={lab.y}>
                  {config.groups[i]}
                </text>
              )}
            </g>
          )
        })}

        {/* C–LG bond + leaving group */}
        <line
          className="bsa__bond bsa__bond--lg"
          x1={C.x}
          y1={C.y}
          x2={lgPos.x}
          y2={lgPos.y}
          style={{ opacity: lgBondOpacity }}
        />
        <g style={{ opacity: lgLabelOpacity }}>
          <circle className="bsa__lg-bg" cx={lgPos.x} cy={lgPos.y} r={14} />
          <text className="bsa__lglabel" x={lgPos.x} y={lgPos.y}>
            {config.leavingGroup}
          </text>
          {lgT > 0.05 && (
            <text className="bsa__charge" x={lgPos.x + 13} y={lgPos.y - 12}>
              −
            </text>
          )}
        </g>

        {/* forming Nu–C bond */}
        {settled && (
          <line
            className="bsa__bond bsa__bond--nu"
            x1={C.x}
            y1={C.y}
            x2={nuPos.x}
            y2={nuPos.y}
            style={{ opacity: inv }}
          />
        )}

        {/* rubber band toward the carbon while aiming */}
        {drag && <line className="bsa__rubber" x1={nuPos.x} y1={nuPos.y} x2={C.x} y2={C.y} />}

        {/* central carbon (electrophile) */}
        <circle className="bsa__c-bg" cx={C.x} cy={C.y} r={14} />
        <text className="bsa__c" x={C.x} y={C.y}>
          C
        </text>
        {!settled && (
          <text className="bsa__delta" x={C.x + 15} y={C.y - 15}>
            δ+
          </text>
        )}

        {/* nucleophile puck */}
        <g className={`bsa__nu ${sterics ? 'is-parked' : ''}`}>
          <circle className="bsa__nu-dot" cx={nuPos.x} cy={nuPos.y} r={NU_R} />
          <text className="bsa__nu-label" x={nuPos.x} y={nuPos.y}>
            {config.nucleophile}
          </text>
          {!sterics && phase === 'idle' && (
            <circle
              className="bsa__nu-hit"
              cx={nuPos.x}
              cy={nuPos.y}
              r={NU_R + 8}
              onPointerDown={onNuDown}
            />
          )}
        </g>
      </svg>

      <div className="bsa__status" role="status">
        {flash ? (
          <span className="bsa__flash">{flash}</span>
        ) : phase === 'done' ? (
          <span className="bsa__done">New bond formed — that’s the product.</span>
        ) : (
          <span className="bsa__note">
            {config.caption ??
              (sterics
                ? 'Switch substrates and watch the opening close in.'
                : `Drag ${config.nucleophile} in toward the carbon.`)}
          </span>
        )}
      </div>

      {sterics && (
        <div className="bsa__sterics">
          <div className="bsa__classes" role="group" aria-label="Substrate class">
            {classes.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`bsa__class ${selected === c.id ? 'is-active' : ''}`}
                onClick={() => selectClass(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="bsa__rate">
            <span className="bsa__rate-label">Relative SN2 rate</span>
            <div className="bsa__rate-track">
              <div
                className="bsa__rate-fill"
                style={{ width: `${(ranked?.rateFrac(selected) ?? 0) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
