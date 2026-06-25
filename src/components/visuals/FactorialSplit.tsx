import { Fragment } from 'react'
import './FactorialSplit.css'

export type FactorialSplitConfig = { n: number; k: number }

// n! laid out as factor chips, split into the factors it keeps (first k) and the
// tail it divides away. Factor VALUES are shown — that's the point — but never a
// product and never the notation/formula, so the rule is the learner's to build,
// not read off the picture.
export function FactorialSplit({ n, k }: FactorialSplitConfig): React.JSX.Element {
  const factors = Array.from({ length: n }, (_, i) => n - i)
  const kept = factors.slice(0, k)
  const dropped = factors.slice(k)

  const chips = (values: number[], offset: number) =>
    values.map((value, i) => (
      <Fragment key={offset + i}>
        {i > 0 && <span className="fsplit__times">×</span>}
        <span className="fsplit__chip" style={{ ['--i' as string]: offset + i } as React.CSSProperties}>
          {value}
        </span>
      </Fragment>
    ))

  return (
    <div className="fsplit">
      <p className="fsplit__lead">
        <span className="fsplit__nfac">{n}!</span> is every factor from {n} down to 1
      </p>

      <div
        className="fsplit__sequence"
        role="img"
        aria-label={`${n} factorial equals ${factors.join(
          ' times ',
        )}. The first ${k} factors are the ones you keep; the remaining ${
          n - k
        } are divided away.`}
      >
        <div className="fsplit__group fsplit__group--kept">
          <div className="fsplit__chips">{chips(kept, 0)}</div>
          <span className="fsplit__brace" aria-hidden="true" />
          <span className="fsplit__tag">the {k} you keep</span>
        </div>

        {dropped.length > 0 && (
          <>
            <span className="fsplit__times fsplit__times--join">×</span>

            <div className="fsplit__group fsplit__group--dropped">
              <div className="fsplit__chips">{chips(dropped, k)}</div>
              <span className="fsplit__brace" aria-hidden="true" />
              <span className="fsplit__tag">divide these away</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
