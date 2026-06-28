import { useMemo, useRef, useState } from 'react'
import type { ArrowPushConfig, ArrowSite, ChemAtom } from '../../types/orgo'
import { STAGE, curvedArrowPath, dist, polar, useStagePoint } from './chemKit'
import './ArrowPush.css'

const HIT = 30

export function ArrowPush({
  config,
  onSolved,
}: {
  config: ArrowPushConfig
  onSolved: () => void
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const toStage = useStagePoint(svgRef)
  const [drawn, setDrawn] = useState<Set<string>>(new Set())
  const [drag, setDrag] = useState<{ from: ArrowSite; x: number; y: number } | null>(null)
  const [hoverHead, setHoverHead] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [solved, setSolved] = useState(false)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const atomById = useMemo(() => {
    const m: Record<string, ChemAtom> = {}
    for (const a of config.atoms) m[a.id] = a
    return m
  }, [config.atoms])

  const usedTailIds = useMemo(() => {
    const s = new Set<string>()
    for (const id of drawn) {
      const sol = config.solution.find((x) => x.id === id)
      if (sol) s.add(sol.from)
    }
    return s
  }, [drawn, config.solution])

  const showFlash = (msg: string) => {
    setFlash(msg)
    if (flashTimer.current) clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlash(null), 2200)
  }

  const nearestHead = (x: number, y: number): ArrowSite | null => {
    let best: ArrowSite | null = null
    let bestD = HIT
    for (const h of config.heads) {
      const d = dist(h.x, h.y, x, y)
      if (d <= bestD) {
        best = h
        bestD = d
      }
    }
    return best
  }

  const startDrag = (site: ArrowSite, e: React.PointerEvent) => {
    if (solved) return
    e.preventDefault()
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    setFlash(null)
    setDrag({ from: site, x: site.x, y: site.y })
  }

  const moveDrag = (e: React.PointerEvent) => {
    if (!drag) return
    const { x, y } = toStage(e)
    setDrag({ ...drag, x, y })
    const h = nearestHead(x, y)
    setHoverHead(h?.id ?? null)
  }

  const endDrag = (e: React.PointerEvent) => {
    if (!drag) return
    const { x, y } = toStage(e)
    const from = drag.from
    setDrag(null)
    setHoverHead(null)
    const head = nearestHead(x, y)
    if (!head) return
    const sol = config.solution.find((s) => s.from === from.id && s.to === head.id)
    if (!sol) {
      showFlash(config.hint ?? 'Arrows start on electrons and point at the electron-poor atom.')
      return
    }
    if (drawn.has(sol.id)) return
    const next = new Set(drawn)
    next.add(sol.id)
    setDrawn(next)
    if (next.size === config.solution.length) {
      setSolved(true)
      setTimeout(onSolved, 700)
    }
  }

  const lonePairDots = (a: ChemAtom, count: number) => {
    if (count <= 0) return null
    // fan the pairs on the side of the atom facing away from the molecule centre
    const base = Math.atan2(a.y - STAGE / 2, a.x - STAGE / 2) * (180 / Math.PI)
    const angles = [base, base - 46, base + 46, base + 92].slice(0, count)
    return angles.map((ang, i) => {
      const c = polar(a.x, a.y, 20, ang)
      const p1 = polar(c.x, c.y, 3.4, ang + 90)
      const p2 = polar(c.x, c.y, 3.4, ang - 90)
      return (
        <g key={`lp-${a.id}-${i}`} className="ap__lp">
          <circle cx={p1.x} cy={p1.y} r={2.1} />
          <circle cx={p2.x} cy={p2.y} r={2.1} />
        </g>
      )
    })
  }

  const drawnArrowEls = config.solution
    .filter((s) => drawn.has(s.id))
    .map((s) => {
      const t = config.tails.find((x) => x.id === s.from)
      const h = config.heads.find((x) => x.id === s.to)
      if (!t || !h) return null
      return (
        <path
          key={s.id}
          className="ap__arrow"
          d={curvedArrowPath(t.x, t.y, h.x, h.y, -38)}
          markerEnd="url(#ap-head)"
          fill="none"
        />
      )
    })

  const isBreaking = (bondId: string) => solved && (config.breakBonds ?? []).includes(bondId)

  return (
    <div className={`ap ${solved ? 'is-solved' : ''}`}>
      <svg
        ref={svgRef}
        className="ap__svg"
        viewBox={`0 0 ${STAGE} ${STAGE}`}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
      >
        <defs>
          <marker
            id="ap-head"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0,1 L8,5 L0,9" className="ap__arrowhead" />
          </marker>
        </defs>

        {/* existing bonds */}
        {config.bonds.map((b) => {
          const a = atomById[b.a]
          const c = atomById[b.b]
          if (!a || !c) return null
          return (
            <line
              key={b.id}
              className={`ap__bond ${isBreaking(b.id) ? 'is-breaking' : ''}`}
              x1={a.x}
              y1={a.y}
              x2={c.x}
              y2={c.y}
            />
          )
        })}

        {/* newly formed bonds */}
        {solved &&
          (config.formBonds ?? []).map((fb, i) => {
            const a = atomById[fb.a]
            const c = atomById[fb.b]
            if (!a || !c) return null
            return (
              <line
                key={`form-${i}`}
                className="ap__bond ap__bond--new"
                x1={a.x}
                y1={a.y}
                x2={c.x}
                y2={c.y}
              />
            )
          })}

        {/* atoms */}
        {config.atoms.map((a) => {
          const leaving = solved && a.id === config.leavingId
          // charges update on the product: nucleophile/electrophile neutralize,
          // the leaving group walks off carrying the electrons (gains −).
          const neutralizes = a.role === 'nucleophile' || a.role === 'electrophile'
          const shownCharge = solved
            ? leaving
              ? -1
              : neutralizes
                ? 0
                : (a.charge ?? 0)
            : (a.charge ?? 0)
          // the nucleophile spends one lone pair to form the new bond
          const lpCount =
            solved && a.role === 'nucleophile'
              ? Math.max(0, (a.lonePairs ?? 0) - 1)
              : (a.lonePairs ?? 0)
          return (
            <g
              key={a.id}
              className={`ap__atom ap__atom--${a.role ?? 'plain'} ${leaving ? 'is-leaving' : ''}`}
            >
              {lonePairDots(a, lpCount)}
              <circle className="ap__atom-disc" cx={a.x} cy={a.y} r={15} />
              <text className="ap__atom-label" x={a.x} y={a.y}>
                {a.label}
              </text>
              {a.delta && !solved && (
                <text className="ap__delta" x={a.x + 18} y={a.y - 14}>
                  {a.delta === 'plus' ? 'δ+' : 'δ−'}
                </text>
              )}
              {shownCharge !== 0 && (
                <text className={`ap__charge ap__charge--${shownCharge > 0 ? 'pos' : 'neg'}`} x={a.x + 14} y={a.y - 12}>
                  {shownCharge > 0 ? '+' : '−'}
                </text>
              )}
            </g>
          )
        })}

        {drawnArrowEls}

        {/* rubber-band while dragging */}
        {drag && (
          <path className="ap__rubber" d={curvedArrowPath(drag.from.x, drag.from.y, drag.x, drag.y, -30)} fill="none" markerEnd="url(#ap-head)" />
        )}

        {/* head targets (drop affordance) */}
        {!solved &&
          config.heads.map((h) => (
            <circle
              key={h.id}
              className={`ap__head ${hoverHead === h.id ? 'is-hover' : ''} ${drag ? 'is-armed' : ''}`}
              cx={h.x}
              cy={h.y}
              r={hoverHead === h.id ? 15 : 10}
            />
          ))}

        {/* tail handles (electron sources) — start a drag here */}
        {!solved &&
          config.tails.map((t) => (
            <circle
              key={t.id}
              className={`ap__tail ${usedTailIds.has(t.id) ? 'is-used' : ''}`}
              cx={t.x}
              cy={t.y}
              r={9}
              onPointerDown={(e) => startDrag(t, e)}
            />
          ))}
      </svg>

      <div className="ap__status" role="status">
        {flash ? (
          <span className="ap__flash">{flash}</span>
        ) : solved ? (
          <span className="ap__done">Bond formed — that’s the product.</span>
        ) : (
          <span className="ap__note">
            {config.caption ?? 'Drag from the electrons (●) to the electron-poor atom.'}
          </span>
        )}
      </div>
    </div>
  )
}
