import { useEffect, useMemo, useRef, useState } from 'react'
import type { Mechanism, PathwayConsoleConfig, SubstrateClass } from '../../types/orgo'
import './PathwayConsole.css'

type ReagentId = 'strong-nu' | 'small-base' | 'bulky-base' | 'weak'

const SUBSTRATES: { id: SubstrateClass; label: string }[] = [
  { id: 'methyl', label: 'methyl' },
  { id: '1°', label: '1°' },
  { id: '2°', label: '2°' },
  { id: '3°', label: '3°' },
]

const REAGENTS: { id: ReagentId; formula: string; desc: string }[] = [
  { id: 'strong-nu', formula: 'I⁻', desc: 'strong Nu, weak base' },
  { id: 'small-base', formula: 'HO⁻', desc: 'strong base' },
  { id: 'bulky-base', formula: 't-BuOK', desc: 'strong bulky base' },
  { id: 'weak', formula: 'H₂O', desc: 'weak, neutral' },
]

/** Read top→bottom, left→right: SN1 SN2 / E1 E2. */
const GRID: Mechanism[] = ['SN1', 'SN2', 'E1', 'E2']
const REAGENT_IDS = REAGENTS.map((r) => r.id) as string[]

type CellState = 'major' | 'minor' | 'ruled' | 'neutral'

type Prediction = {
  /** Structurally impossible for this substrate → crossed out in --flag. */
  ruledOut: Set<Mechanism>
  /** Predicted dominant pathway(s) → highlighted in --grow. */
  dominant: Mechanism[]
  /** For a mixture, the heat-favored one to emphasize. */
  emphasized?: Mechanism
  note: string
  product: string
}

/** Mechanisms a substrate can never do (no β-H, or no stable carbocation, or too hindered). */
function ruledOutFor(sub: SubstrateClass): Mechanism[] {
  switch (sub) {
    case 'methyl':
      return ['SN1', 'E1', 'E2'] // no β-H (no E), no stable cation (no SN1/E1)
    case '1°':
      return ['SN1', 'E1'] // primary cation won't form
    case '3°':
      return ['SN2'] // too hindered for backside attack
    default:
      return [] // 2° can do all four
  }
}

/**
 * The capstone decision logic: dominant pathway for a fully-dialed scenario.
 * Substrate sets what's possible, the reagent picks substitution vs elimination,
 * and heat tips ties toward elimination.
 */
function predict(sub: SubstrateClass, reagent: ReagentId, heat: boolean): Prediction {
  const ruledOut = new Set(ruledOutFor(sub))
  const p = (dominant: Mechanism[], note: string, product: string, emphasized?: Mechanism): Prediction => ({
    ruledOut,
    dominant,
    emphasized,
    note,
    product,
  })

  if (sub === 'methyl')
    return p(['SN2'], 'Methyl has no β-hydrogen and forms no cation — only SN2 is possible.', 'substitution product')

  if (sub === '1°') {
    if (reagent === 'bulky-base')
      return p(['E2'], 'A bulky base can’t reach the 1° carbon to substitute → E2.', 'alkene')
    if (reagent === 'small-base')
      return heat
        ? p(['E2'], 'Heat plus a strong base on a 1° carbon tips it to elimination → E2.', 'alkene')
        : p(['SN2'], 'A strong base on 1°, kept cool → mostly SN2 (a little E2).', 'substitution product')
    if (reagent === 'weak')
      return p(['SN2'], 'A weak, neutral reagent on 1°: no cation forms, so it barely reacts (slow SN2).', 'substitution product (slow)')
    return p(['SN2'], 'A strong nucleophile that’s a weak base on a 1° carbon → SN2.', 'substitution product')
  }

  if (sub === '2°') {
    if (reagent === 'bulky-base' || reagent === 'small-base')
      return p(['E2'], 'A strong base on a 2° carbon → E2 wins.', 'alkene')
    if (reagent === 'weak')
      return p(
        ['SN1', 'E1'],
        heat
          ? 'A weak, neutral reagent on 2° with heat → SN1/E1, elimination (E1) favored.'
          : 'A weak, neutral reagent on 2° → SN1/E1, substitution (SN1) favored.',
        'substitution + alkene',
        heat ? 'E1' : 'SN1',
      )
    return p(['SN2'], 'A good nucleophile that’s a weak base on a 2° carbon → SN2.', 'substitution product')
  }

  // 3° — no SN2. A strong base eliminates (E2); otherwise it ionizes (SN1/E1).
  if (reagent === 'bulky-base' || reagent === 'small-base')
    return p(['E2'], 'A strong base on a 3° carbon → E2.', 'alkene')
  if (reagent === 'strong-nu')
    return p(
      ['SN1', 'E1'],
      heat
        ? 'No SN2 on 3°, and a weak base can’t do E2 — it ionizes; heat favors E1.'
        : 'No SN2 on 3°, and a weak base can’t do E2 — it ionizes to SN1 (some E1).',
      'substitution + alkene',
      heat ? 'E1' : 'SN1',
    )
  return p(
    ['SN1', 'E1'],
    heat
      ? 'A weak reagent on 3° ionizes; heat favors elimination → E1 (some SN1).'
      : 'A weak reagent on 3° ionizes; kept cool → SN1 (some E1).',
    'substitution + alkene',
    heat ? 'E1' : 'SN1',
  )
}

/** S_N1 / S_N2 with a subscript N; E1 / E2 as-is. */
function MechName({ m }: { m: Mechanism }) {
  if (m[0] === 'S')
    return (
      <>
        S<sub>N</sub>
        {m.slice(2)}
      </>
    )
  return <>{m}</>
}

function tagFor(state: CellState, isMixture: boolean): string {
  if (state === 'ruled') return 'can’t'
  if (state === 'minor') return 'minor'
  if (state === 'major') return isMixture ? 'major' : 'predicted'
  return ''
}

export function PathwayConsole({
  config,
  onSolved,
}: {
  config: PathwayConsoleConfig
  onSolved: () => void
}) {
  const target = config.target
  const [substrate, setSubstrate] = useState<SubstrateClass>(target?.substrate ?? '2°')
  const [reagent, setReagent] = useState<ReagentId>(
    target && REAGENT_IDS.includes(target.reagent) ? (target.reagent as ReagentId) : 'strong-nu',
  )
  const [heat, setHeat] = useState<boolean>(target?.heat ?? false)
  const [seen, setSeen] = useState<Set<Mechanism>>(() => new Set())
  const [solved, setSolved] = useState(false)
  const firedRef = useRef(false)
  const onSolvedRef = useRef(onSolved)
  useEffect(() => {
    onSolvedRef.current = onSolved
  }, [onSolved])

  const pred = useMemo(() => predict(substrate, reagent, heat), [substrate, reagent, heat])

  // Accumulate the distinct dominant pathways the learner has surfaced.
  useEffect(() => {
    setSeen((prev) => {
      const next = new Set(prev)
      for (const m of pred.dominant) next.add(m)
      return next
    })
  }, [pred])

  // Fire once: after 3 distinct mechanisms seen, or when the dialed-in scenario
  // matches an optional target.
  useEffect(() => {
    if (firedRef.current) return
    const targetHit =
      !!target &&
      substrate === target.substrate &&
      reagent === (target.reagent as ReagentId) &&
      heat === target.heat &&
      pred.dominant.includes(target.mechanism)
    if (seen.size >= 3 || targetHit) {
      firedRef.current = true
      setSolved(true)
      // Fire once; intentionally not cancelled on re-render so a rapid extra
      // click right at the threshold can't swallow the single onSolved call.
      setTimeout(() => onSolvedRef.current(), 500)
    }
  }, [seen, pred, substrate, reagent, heat, target])

  const isMixture = pred.dominant.length > 1
  const cellState = (m: Mechanism): CellState => {
    if (pred.ruledOut.has(m)) return 'ruled'
    if (pred.dominant.includes(m)) {
      if (!isMixture) return 'major'
      return m === pred.emphasized ? 'major' : 'minor'
    }
    return 'neutral'
  }

  return (
    <div className={`pc ${solved ? 'is-solved' : ''}`}>
      {config.caption && <p className="pc__caption">{config.caption}</p>}

      <div className="pc__controls">
        <div className="pc__group">
          <span className="pc__legend">Substrate</span>
          <div className="pc__seg" role="group" aria-label="Substrate class">
            {SUBSTRATES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`pc__opt pc__opt--substrate ${substrate === s.id ? 'is-on' : ''}`}
                aria-pressed={substrate === s.id}
                onClick={() => setSubstrate(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pc__group">
          <span className="pc__legend">Reagent</span>
          <div className="pc__reagents" role="group" aria-label="Reagent">
            {REAGENTS.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`pc__opt pc__opt--reagent ${reagent === r.id ? 'is-on' : ''}`}
                aria-pressed={reagent === r.id}
                onClick={() => setReagent(r.id)}
              >
                <span className="pc__reagent-formula">{r.formula}</span>
                <span className="pc__reagent-desc">{r.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pc__group">
          <span className="pc__legend">Temperature</span>
          <div className="pc__seg pc__seg--heat" role="group" aria-label="Temperature">
            <button
              type="button"
              className={`pc__opt pc__opt--cool ${!heat ? 'is-on' : ''}`}
              aria-pressed={!heat}
              onClick={() => setHeat(false)}
            >
              room temp
            </button>
            <button
              type="button"
              className={`pc__opt pc__opt--heat ${heat ? 'is-on' : ''}`}
              aria-pressed={heat}
              onClick={() => setHeat(true)}
            >
              Δ heat
            </button>
          </div>
        </div>
      </div>

      <div className="pc__grid" role="group" aria-label="Predicted mechanism">
        {GRID.map((m) => {
          const state = cellState(m)
          return (
            <div key={m} className={`pc__cell pc__cell--${state}`}>
              <span className="pc__mech">
                <MechName m={m} />
              </span>
              <span className="pc__tag">{tagFor(state, isMixture)}</span>
            </div>
          )
        })}
      </div>

      <div className="pc__status" role="status">
        {solved && <span className="pc__done">Explored — you can read the map for any conditions.</span>}
        <span className="pc__note">{pred.note}</span>
        <span className="pc__product">→ {pred.product}</span>
      </div>
    </div>
  )
}
