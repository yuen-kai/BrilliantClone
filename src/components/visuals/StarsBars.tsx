import { useState } from 'react'
import type { StarsBarsVisual } from '../../types/lesson'
import './StarsBars.css'

type Sym = 'star' | 'bar'

function makeArrangement(stars: number, bars: number): Sym[] {
  const arr: Sym[] = [
    ...Array<Sym>(stars).fill('star'),
    ...Array<Sym>(bars).fill('bar'),
  ]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function distribution(arr: Sym[]): number[] {
  const groups = [0]
  for (const s of arr) {
    if (s === 'bar') groups.push(0)
    else groups[groups.length - 1] += 1
  }
  return groups
}

export function StarsBars({ stars, bars, groupNoun }: Omit<StarsBarsVisual, 'component'>) {
  const [arr, setArr] = useState<Sym[]>(() => makeArrangement(stars, bars))
  const dist = distribution(arr)

  return (
    <div className="stars-bars">
      <div className="stars-bars__row" aria-label="A row of stars and bars">
        {arr.map((s, i) =>
          s === 'star' ? (
            <span key={i} className="stars-bars__star">
              ★
            </span>
          ) : (
            <span key={i} className="stars-bars__bar" aria-hidden="true" />
          ),
        )}
      </div>

      <div className="stars-bars__dist">
        {dist.map((c, i) => (
          <span key={i} className="stars-bars__group">
            {groupNoun} {i + 1}
            <strong>{c}</strong>
          </span>
        ))}
      </div>

      <button
        type="button"
        className="stars-bars__btn"
        onClick={() => setArr(makeArrangement(stars, bars))}
      >
        Show another sharing
      </button>
    </div>
  )
}
