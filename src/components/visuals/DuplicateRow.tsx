import { useLayoutEffect, useRef, useState } from 'react'
import type { DuplicateRowVisual } from '../../types/lesson'
import './DuplicateRow.css'

type Tile = DuplicateRowVisual['tiles'][number]

export function DuplicateRow({ tiles, word }: { tiles: Tile[]; word: string }) {
  const [order, setOrder] = useState<Tile[]>(tiles)

  const groupSize = tiles.reduce<Record<string, number>>((m, t) => {
    m[t.groupId] = (m[t.groupId] ?? 0) + 1
    return m
  }, {})

  // Subscript labels (O₁, O₂) so the swap is visible even though the letters match.
  const subIndex = new Map<string, number>()
  const seen: Record<string, number> = {}
  for (const t of tiles) {
    if (groupSize[t.groupId] > 1) {
      seen[t.groupId] = (seen[t.groupId] ?? 0) + 1
      subIndex.set(t.id, seen[t.groupId])
    }
  }
  const dupGroup = Object.keys(groupSize).find((g) => groupSize[g] > 1)

  const els = useRef(new Map<string, HTMLSpanElement>())
  const prevRects = useRef(new Map<string, DOMRect>())
  const setEl = (id: string) => (el: HTMLSpanElement | null) => {
    if (el) els.current.set(id, el)
    else els.current.delete(id)
  }

  useLayoutEffect(() => {
    const newRects = new Map<string, DOMRect>()
    els.current.forEach((el, id) => newRects.set(id, el.getBoundingClientRect()))
    newRects.forEach((rect, id) => {
      const p = prevRects.current.get(id)
      const el = els.current.get(id)
      if (!p || !el) return
      const dx = p.left - rect.left
      if (Math.abs(dx) < 1) return
      el.style.transition = 'none'
      el.style.transform = `translateX(${dx}px)`
      requestAnimationFrame(() => {
        el.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
        el.style.transform = ''
      })
    })
    prevRects.current = newRects
  }, [order])

  const swap = () => {
    if (!dupGroup) return
    const idxs = order
      .map((t, i) => (t.groupId === dupGroup ? i : -1))
      .filter((i) => i >= 0)
    if (idxs.length < 2) return
    const a = idxs[0]
    const b = idxs[idxs.length - 1]
    const next = order.slice()
    ;[next[a], next[b]] = [next[b], next[a]]
    setOrder(next)
  }

  return (
    <div className="dup-row">
      <div className="dup-row__tiles" aria-label={`Letters of ${word}`}>
        {order.map((t) => {
          const identical = groupSize[t.groupId] > 1
          const sub = subIndex.get(t.id)
          return (
            <span
              key={t.id}
              ref={setEl(t.id)}
              className={`dup-tile ${identical ? 'is-identical' : ''}`}
            >
              {t.label}
              {sub && <sub className="dup-tile__sub">{sub}</sub>}
            </span>
          )
        })}
      </div>

      <button type="button" className="dup-row__btn" onClick={swap}>
        Swap the identical letters
      </button>

      <p className="dup-row__note">
        The two highlighted letters are identical, so swapping them still spells{' '}
        <strong>{word}</strong>. That duplicate is what we divide away.
      </p>
    </div>
  )
}
