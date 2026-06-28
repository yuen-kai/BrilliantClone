import { useEffect, useRef, useState } from 'react'

/** Every chemistry widget draws into a square SVG of this many user units, then
 * scales to fit its container. Keeping one coordinate space makes the pointer
 * math and the config x,y values portable across widgets. */
export const STAGE = 300

/** Map a pointer event to STAGE coordinates within a ref'd element. */
export function useStagePoint(ref: React.RefObject<HTMLElement | SVGElement | null>) {
  return (e: { clientX: number; clientY: number }) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return { x: 0, y: 0 }
    return {
      x: ((e.clientX - rect.left) / rect.width) * STAGE,
      y: ((e.clientY - rect.top) / rect.height) * STAGE,
    }
  }
}

/** Honors prefers-reduced-motion so animations can be skipped. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return
    setReduced(mq.matches)
    const on = () => setReduced(mq.matches)
    mq.addEventListener?.('change', on)
    return () => mq.removeEventListener?.('change', on)
  }, [])
  return reduced
}

export const polar = (cx: number, cy: number, r: number, deg: number) => ({
  x: cx + r * Math.cos((deg * Math.PI) / 180),
  y: cy + r * Math.sin((deg * Math.PI) / 180),
})

export const dist = (ax: number, ay: number, bx: number, by: number) =>
  Math.hypot(ax - bx, ay - by)

/** Signed angle (deg, 0…360) of the vector from (ox,oy) to (px,py). */
export const angleDeg = (ox: number, oy: number, px: number, py: number) => {
  const a = (Math.atan2(py - oy, px - ox) * 180) / Math.PI
  return (a + 360) % 360
}

/** Smallest absolute difference between two angles, in [0,180]. */
export const angleGap = (a: number, b: number) => {
  const d = Math.abs(((a - b + 540) % 360) - 180)
  return d
}

/** A quadratic-bezier "curved arrow" path string, bowed out by `bow` px on the
 * left of the tail→head vector. Used for double-barbed electron-pushing arrows. */
export function curvedArrowPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  bow = 36,
): string {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const cx = mx + nx * bow
  const cy = my + ny * bow
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`
}

/** Stable hook for a value that should latch true once and stay (e.g. solved). */
export function useLatch(): [boolean, () => void] {
  const [on, setOn] = useState(false)
  const fired = useRef(false)
  const fire = () => {
    if (fired.current) return
    fired.current = true
    setOn(true)
  }
  return [on, fire]
}
