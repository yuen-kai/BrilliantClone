import { useMemo, useRef, useState } from 'react'
import './AnagramBoard.css'

export type AnagramBoardConfig = {
  word: string
  tiles: { id: string; label: string; groupId: string }[]
}

type Tile = AnagramBoardConfig['tiles'][number]

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items]
  const out: T[][] = []
  items.forEach((item, i) => {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)]
    for (const p of permutations(rest)) out.push([item, ...p])
  })
  return out
}

const SUBS = '₀₁₂₃₄₅₆₇₈₉'
const toSub = (n: number) =>
  String(n)
    .split('')
    .map((d) => SUBS[Number(d)])
    .join('')

export function AnagramBoard({ config }: { config: AnagramBoardConfig }): React.JSX.Element {
  const [order, setOrder] = useState<Tile[]>(config.tiles)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragDX, setDragDX] = useState(0)
  const [dropIndex, setDropIndex] = useState(0)

  const tilesRef = useRef<HTMLDivElement>(null)
  const els = useRef(new Map<string, HTMLButtonElement>())
  // Drag geometry, snapshotted on pointer down so it stays valid mid-drag.
  const geo = useRef({ downX: 0, from: 0, pitch: 0, centers: [] as number[] })

  // Subscript per tile, only for groups with more than one member.
  const subs = useMemo(() => {
    const totals = new Map<string, number>()
    config.tiles.forEach((t) => totals.set(t.groupId, (totals.get(t.groupId) ?? 0) + 1))
    const seen = new Map<string, number>()
    const map = new Map<string, number>()
    config.tiles.forEach((t) => {
      if ((totals.get(t.groupId) ?? 0) > 1) {
        const k = (seen.get(t.groupId) ?? 0) + 1
        seen.set(t.groupId, k)
        map.set(t.id, k)
      }
    })
    return map
  }, [config.tiles])

  const perms = useMemo(() => permutations(config.tiles), [config.tiles])

  const setEl = (id: string) => (el: HTMLButtonElement | null) => {
    if (el) els.current.set(id, el)
    else els.current.delete(id)
  }

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>, id: string) => {
    const centers = order.map((t) => {
      const r = els.current.get(t.id)?.getBoundingClientRect()
      return r ? r.left + r.width / 2 : 0
    })
    e.currentTarget.setPointerCapture(e.pointerId)
    geo.current = {
      downX: e.clientX,
      from: order.findIndex((t) => t.id === id),
      pitch: centers.length > 1 ? centers[1] - centers[0] : 64,
      centers,
    }
    setDragId(id)
    setDragDX(0)
    setDropIndex(geo.current.from)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragId) return
    const { downX, from, centers } = geo.current
    setDragDX(e.clientX - downX)
    let to = centers.filter((c) => e.clientX > c).length
    if (to > from) to -= 1
    to = Math.max(0, Math.min(order.length - 1, to))
    setDropIndex(to)
  }

  const endDrag = () => {
    if (!dragId) return
    const without = order.filter((t) => t.id !== dragId)
    const dragged = order.find((t) => t.id === dragId)
    if (dragged) {
      setOrder([...without.slice(0, dropIndex), dragged, ...without.slice(dropIndex)])
    }
    setDragId(null)
    setDragDX(0)
  }

  // While dragging, the lifted tile follows the pointer and the rest slide to
  // open a gap at the drop slot — without reordering the DOM (which would drop
  // pointer capture and kill the drag).
  const tileStyle = (tile: Tile, i: number): React.CSSProperties => {
    if (!dragId) return {}
    if (tile.id === dragId) {
      return { transform: `translate(${dragDX}px, -10px) scale(1.06)`, transition: 'none', zIndex: 5 }
    }
    const without = order.filter((t) => t.id !== dragId)
    const j = without.findIndex((t) => t.id === tile.id)
    const slot = j < dropIndex ? j : j + 1
    return { transform: `translateX(${(slot - i) * geo.current.pitch}px)` }
  }

  const boardSpelling = order.map((t) => t.label).join('')

  return (
    <div className="anagram">
      <div className="anagram__main">
        <div className="anagram__tiles" ref={tilesRef} aria-label={`Letters of ${config.word}`}>
          {order.map((t, i) => (
            <button
              type="button"
              key={t.id}
              ref={setEl(t.id)}
              onPointerDown={(e) => onPointerDown(e, t.id)}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              className={`anagram-tile ${dragId === t.id ? 'is-dragging' : ''}`}
              style={tileStyle(t, i)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="anagram__hint">Drag the tiles to rearrange them.</p>
      </div>

      <aside className="anagram__options">
        <div className="anagram__options-head">Ignoring repeats</div>
        <div className="anagram__options-sub">every ordering</div>
        <ul className="anagram__options-list">
          {perms.map((perm, i) => {
            const match = perm.map((t) => t.label).join('') === boardSpelling
            const text = perm
              .map((t) => {
                const k = subs.get(t.id)
                return k ? `${t.label}${toSub(k)}` : t.label
              })
              .join(' ')
            return (
              <li key={i} className={`anagram__option ${match ? 'is-match' : ''}`}>
                {text}
              </li>
            )
          })}
        </ul>
      </aside>
    </div>
  )
}
