import { useEffect, useMemo, useRef, useState } from 'react'
import type { MechanismCanvasConfig } from '../../types/lesson'
import './MechanismCanvas.css'

const STAGE_W = 320
const STAGE_H = 220
const HIT = 30

/**
 * The curved-arrow canvas: the learner drags double-barbed arrows from electron
 * sources (lone pairs / bonds) to electrophilic sites. Drawing the correct set
 * forms the product (and ejects a leaving group), then reports `onSolved`. The
 * visual shows structure only — never the verdict; every count/choice is gated
 * outside this widget.
 */
export function MechanismCanvas({
  config,
  onSolved,
}: {
  config: MechanismCanvasConfig
  onSolved?: () => void
}) {
  const { atoms, bonds, tails, heads, solution, equivalentHeads } = config
  const breakBonds = config.breakBonds ?? []
  const formBonds = config.formBonds ?? []
  const svgRef = useRef<SVGSVGElement>(null)
  const [drag, setDrag] = useState<{ tail: string; x: number; y: number } | null>(null)
  const [drawn, setDrawn] = useState<string[]>([])
  const [flash, setFlash] = useState<string | null>(null)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const solvedRef = useRef(false)

  const atomById = useMemo(() => Object.fromEntries(atoms.map((a) => [a.id, a])), [atoms])
  const siteById = useMemo(
    () => Object.fromEntries([...tails, ...heads].map((s) => [s.id, s])),
    [tails, heads],
  )

  // Required arrows as canonical "tail->head" keys (order-independent).
  const required = useMemo(
    () => solution.map((s) => `${s.tail}->${s.head}`),
    [solution],
  )
  const canonHead = (id: string) => equivalentHeads?.[id] ?? id
  const solved = required.every((r) => drawn.includes(r))

  useEffect(() => {
    if (solved && !solvedRef.current) {
      solvedRef.current = true
      const t = setTimeout(() => onSolved?.(), 650)
      return () => clearTimeout(t)
    }
  }, [solved, onSolved])

  const showFlash = (msg: string) => {
    setFlash(msg)
    if (flashTimer.current) clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlash(null), 2200)
  }

  const toStage = (e: React.PointerEvent) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: ((e.clientX - rect.left) / rect.width) * STAGE_W,
      y: ((e.clientY - rect.top) / rect.height) * STAGE_H,
    }
  }

  const headAt = (x: number, y: number) => {
    let best: string | null = null
    let bestDist = HIT
    for (const h of heads) {
      const d = Math.hypot(h.x - x, h.y - y)
      if (d <= bestDist) {
        best = h.id
        bestDist = d
      }
    }
    return best
  }

  const startDrag = (tailId: string, e: React.PointerEvent) => {
    if (solved) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const s = siteById[tailId]
    setDrag({ tail: tailId, x: s.x, y: s.y })
    setFlash(null)
  }

  const moveDrag = (e: React.PointerEvent) => {
    if (!drag) return
    const { x, y } = toStage(e)
    setDrag({ ...drag, x, y })
  }

  const endDrag = (e: React.PointerEvent) => {
    if (!drag) return
    const { tail } = drag
    setDrag(null)
    const { x, y } = toStage(e)
    const target = headAt(x, y)
    if (!target) return
    const key = `${tail}->${canonHead(target)}`
    if (drawn.includes(key)) return
    if (required.includes(key)) {
      setDrawn((d) => [...d, key])
    } else {
      showFlash(config.hint ?? 'Not quite — arrows start on electrons and point to the electron-poor site.')
    }
  }

  // Curved (quadratic) path from a tail site to a head site, bowed sideways.
  const arrowPath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const mx = (from.x + to.x) / 2
    const my = (from.y + to.y) / 2
    const dx = to.x - from.x
    const dy = to.y - from.y
    const len = Math.hypot(dx, dy) || 1
    const bow = Math.min(38, len * 0.4)
    const cx = mx - (dy / len) * bow
    const cy = my + (dx / len) * bow
    return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`
  }

  // A donated lone pair becomes the new σ bond, so once a product bond is drawn
  // the pair the nucleophile gave up is no longer a lone pair (NH₃ → NH₄⁺). Only
  // applies to atoms that actually gain a formBond, so product-less steps are unchanged.
  const lonePairsConsumed: Record<string, number> = {}
  for (const f of formBonds) {
    for (const end of [f.a, f.b]) {
      const donated = solution.some(
        (s) => siteById[s.tail]?.kind === 'lone-pair' && siteById[s.tail]?.on === end,
      )
      if (donated) lonePairsConsumed[end] = (lonePairsConsumed[end] ?? 0) + 1
    }
  }

  return (
    <div className={`mcanvas ${solved ? 'is-solved' : ''}`}>
      <svg
        ref={svgRef}
        className="mcanvas__svg"
        viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
        style={{ touchAction: 'none' }}
        role="img"
        aria-label="Curved-arrow mechanism canvas"
      >
        <defs>
          <marker
            id="mcanvas-head"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 L3,5 z" className="mcanvas__arrowhead" />
          </marker>
        </defs>

        {/* bonds — drop broken ones and add the freshly formed product bonds once solved */}
        {(solved ? [...bonds.filter((b) => !breakBonds.includes(b.id)), ...formBonds] : bonds).map((b) => {
          const a = atomById[b.a]
          const c = atomById[b.b]
          if (!a || !c) return null
          const order = b.order ?? 1
          const isNew = solved && formBonds.some((f) => f.id === b.id)
          const dx = c.x - a.x
          const dy = c.y - a.y
          const len = Math.hypot(dx, dy) || 1
          const ox = (-dy / len) * 3.2
          const oy = (dx / len) * 3.2
          const lines = order === 1 ? [0] : order === 2 ? [-1, 1] : [-1, 0, 1]
          return (
            <g key={b.id} className={`mcanvas__bond ${isNew ? 'mcanvas__bond--new' : ''}`}>
              {lines.map((m, i) => (
                <line
                  key={i}
                  x1={a.x + ox * m}
                  y1={a.y + oy * m}
                  x2={c.x + ox * m}
                  y2={c.y + oy * m}
                />
              ))}
            </g>
          )
        })}

        {/* atoms: label, lone pairs, charge */}
        {atoms.map((a) => {
          const charge =
            solved && config.chargeAfter && a.id in config.chargeAfter ? config.chargeAfter[a.id] : a.charge
          const lpCount = Math.max(0, (a.lonePairs ?? 0) - (solved ? lonePairsConsumed[a.id] ?? 0 : 0))
          return (
          <g
            key={a.id}
            className={`mcanvas__atom ${a.role === 'leaving' ? 'mcanvas__atom--leaving' : ''}`}
          >
            <text x={a.x} y={a.y} className="mcanvas__label">
              {a.label}
            </text>
            {charge ? (
              <text x={a.x + 13} y={a.y - 9} className="mcanvas__charge">
                {charge > 0 ? '+' : '–'}
              </text>
            ) : null}
            {Array.from({ length: lpCount }).map((_, i) => {
              const ang = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(1, lpCount)
              const rx = a.x + Math.cos(ang) * 15
              const ry = a.y + Math.sin(ang) * 15
              const px = -Math.sin(ang) * 2.6
              const py = Math.cos(ang) * 2.6
              return (
                <g key={i} className="mcanvas__lone">
                  <circle cx={rx + px} cy={ry + py} r={1.6} />
                  <circle cx={rx - px} cy={ry - py} r={1.6} />
                </g>
              )
            })}
          </g>
          )
        })}

        {/* confirmed arrows */}
        {drawn.map((key) => {
          const [tailId, headId] = key.split('->')
          const t = siteById[tailId]
          const h = siteById[headId] ?? heads.find((x) => canonHead(x.id) === headId)
          if (!t || !h) return null
          return (
            <path
              key={key}
              className="mcanvas__arrow"
              d={arrowPath(t, h)}
              markerEnd="url(#mcanvas-head)"
            />
          )
        })}

        {/* rubber-band arrow while dragging + legal head affordances */}
        {drag && (
          <>
            {heads.map((h) => (
              <circle
                key={h.id}
                className="mcanvas__head-target"
                cx={h.x}
                cy={h.y}
                r={13}
              />
            ))}
            <path
              className="mcanvas__arrow mcanvas__arrow--ghost"
              d={arrowPath(siteById[drag.tail], { x: drag.x, y: drag.y })}
              markerEnd="url(#mcanvas-head)"
            />
          </>
        )}

        {/* tail handles: a grabbable ring wrapping two electron dots (the pair) */}
        {tails.map((t) => (
          <g
            key={t.id}
            className={`mcanvas__tail ${drag?.tail === t.id ? 'is-active' : ''}`}
            onPointerDown={(e) => startDrag(t.id, e)}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
          >
            <circle className="mcanvas__tail-ring" cx={t.x} cy={t.y} r={11} />
            <circle className="mcanvas__tail-dot" cx={t.x - 3.6} cy={t.y} r={2.2} />
            <circle className="mcanvas__tail-dot" cx={t.x + 3.6} cy={t.y} r={2.2} />
          </g>
        ))}
      </svg>

      <div className="mcanvas__status">
        {flash ? (
          <span className="mcanvas__flash">{flash}</span>
        ) : solved ? (
          <span className="mcanvas__done">Bond made.</span>
        ) : (
          <span className="mcanvas__note">{config.caption ?? 'Drag an arrow from the electrons to where the bond forms.'}</span>
        )}
      </div>
    </div>
  )
}
