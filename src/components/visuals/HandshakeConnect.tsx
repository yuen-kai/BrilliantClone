import { useMemo, useRef, useState } from 'react'
import './HandshakeConnect.css'

export type HandshakeConnectConfig = {
  people: { id: string; label: string; emoji: string }[]
}

const STAGE = 256
const CENTER = STAGE / 2
const RADIUS = 96
const HIT_RADIUS = 30

const pairKey = (a: string, b: string) => [a, b].sort().join('-')

export function HandshakeConnect({
  config,
}: {
  config: HandshakeConnectConfig
}): React.JSX.Element {
  const { people } = config
  const n = people.length

  const [edge, setEdge] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [drag, setDrag] = useState<{ from: string; x: number; y: number } | null>(null)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  // Evenly spaced ring positions, rotated so the first node sits at the top.
  const points = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {}
    people.forEach((p, i) => {
      const a = (i * (2 * Math.PI)) / n - Math.PI / 2
      map[p.id] = { x: CENTER + RADIUS * Math.cos(a), y: CENTER + RADIUS * Math.sin(a) }
    })
    return map
  }, [people, n])

  const showFlash = (msg: string) => {
    setFlash(msg)
    if (flashTimer.current) clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlash(null), 1800)
  }

  const labelOf = (id: string) => people.find((p) => p.id === id)?.label ?? id

  const toStage = (e: React.PointerEvent) => {
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: ((e.clientX - rect.left) / rect.width) * STAGE,
      y: ((e.clientY - rect.top) / rect.height) * STAGE,
    }
  }

  const nodeAt = (x: number, y: number) => {
    let best: string | null = null
    let bestDist = HIT_RADIUS
    for (const p of people) {
      const pt = points[p.id]
      const d = Math.hypot(pt.x - x, pt.y - y)
      if (d <= bestDist) {
        best = p.id
        bestDist = d
      }
    }
    return best
  }

  const startDrag = (id: string, e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const pt = points[id]
    setDrag({ from: id, x: pt.x, y: pt.y })
    setFlash(null)
  }

  const moveDrag = (e: React.PointerEvent) => {
    if (!drag) return
    const { x, y } = toStage(e)
    setDrag({ from: drag.from, x, y })
  }

  const endDrag = (e: React.PointerEvent) => {
    if (!drag) return
    const { from } = drag
    setDrag(null)
    const { x, y } = toStage(e)
    const target = nodeAt(x, y)
    if (!target || target === from) return
    const key = pairKey(from, target)
    if (edge === key) {
      showFlash(`Same handshake — ${labelOf(from)}–${labelOf(target)} is ${labelOf(target)}–${labelOf(from)}`)
      return
    }
    setEdge(key)
  }

  const [edgeA, edgeB] = edge ? edge.split('-') : [null, null]
  const isHighlighted = (a: string, b: string) => edge != null && pairKey(a, b) === edge

  return (
    <div className="handshake">
      <div className="handshake__col">
        <div className="handshake__stage" ref={stageRef} style={{ width: STAGE, height: STAGE }}>
          <svg
            className="handshake__lines"
            viewBox={`0 0 ${STAGE} ${STAGE}`}
            width={STAGE}
            height={STAGE}
            aria-hidden="true"
          >
            {edgeA && edgeB && points[edgeA] && points[edgeB] && (
              <g key={edge} className="handshake__edge">
                <line x1={points[edgeA].x} y1={points[edgeA].y} x2={points[edgeB].x} y2={points[edgeB].y} />
                <text
                  x={(points[edgeA].x + points[edgeB].x) / 2}
                  y={(points[edgeA].y + points[edgeB].y) / 2}
                  className="handshake__shake"
                >
                  🤝
                </text>
              </g>
            )}

            {drag && (
              <line
                className="handshake__rubber"
                x1={points[drag.from].x}
                y1={points[drag.from].y}
                x2={drag.x}
                y2={drag.y}
              />
            )}
          </svg>

          {people.map((p) => {
            const pt = points[p.id]
            return (
              <button
                key={p.id}
                type="button"
                className={`handshake__node ${drag?.from === p.id ? 'is-selected' : ''}`}
                style={{ left: pt.x, top: pt.y }}
                onPointerDown={(e) => startDrag(p.id, e)}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
              >
                <span className="handshake__emoji">{p.emoji}</span>
                <span className="handshake__name">{p.label}</span>
              </button>
            )
          })}
        </div>

        <div className="handshake__status">
          {flash ? (
            <span className="handshake__flash">{flash}</span>
          ) : (
            <span className="handshake__note">Drag one friend to another to shake hands.</span>
          )}
        </div>
      </div>

      <aside className="handshake__options">
        <div className="handshake__options-head">Ignoring repeats</div>
        <div className="handshake__options-sub">every ordered greeting</div>
        <ul className="handshake__options-list">
          {people.flatMap((a) =>
            people
              .filter((b) => b.id !== a.id)
              .map((b) => (
                <li
                  key={`${a.id}->${b.id}`}
                  className={`handshake__option ${isHighlighted(a.id, b.id) ? 'is-on' : ''}`}
                >
                  {a.label} → {b.label}
                </li>
              )),
          )}
        </ul>
      </aside>
    </div>
  )
}
