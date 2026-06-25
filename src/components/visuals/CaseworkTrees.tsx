import { useMemo } from 'react'
import './CaseworkTrees.css'

export type CaseworkTreesConfig = {
  parentLabel: string
  cases: { id: string; label: string; emoji: string; factors: number[] }[]
}

type CaseData = CaseworkTreesConfig['cases'][number]

// Deterministic geometry — SVG user units equal pixels so HTML overlays line up.
const TREE_W = 236
const TREE_H = 190
const ROOT_CY = 32
const BOT_PAD = 24
const SIDE_PAD = 20
const GAP = 28
const PARENT_BAND = 84
const PARENT_CY = 30

type Pt = { x: number; y: number }
type Dot = Pt & { leaf: boolean; key: string }
type Edge = { x1: number; y1: number; x2: number; y2: number; key: string }

function buildTree(factors: number[]): { root: Pt; dots: Dot[]; edges: Edge[] } {
  const branches = factors.filter((n) => Number.isFinite(n) && n >= 1)
  const levels = branches.length ? branches : [1]
  const depth = levels.length

  const counts = [1]
  for (const b of levels) counts.push(counts[counts.length - 1] * b)
  const leaves = counts[depth]

  const pitch = (TREE_W - SIDE_PAD * 2) / leaves
  const levelGap = (TREE_H - ROOT_CY - BOT_PAD) / depth
  const yOf = (k: number) => ROOT_CY + k * levelGap

  // Place leaves evenly, then center every parent on its own children (bottom-up).
  const xs: number[][] = []
  xs[depth] = Array.from({ length: leaves }, (_, i) => SIDE_PAD + pitch * (i + 0.5))
  for (let k = depth - 1; k >= 0; k--) {
    const kids = xs[k + 1]
    const span = levels[k]
    xs[k] = Array.from({ length: counts[k] }, (_, j) => {
      let sum = 0
      for (let c = 0; c < span; c++) sum += kids[j * span + c]
      return sum / span
    })
  }

  const dots: Dot[] = []
  for (let k = 1; k <= depth; k++) {
    for (let j = 0; j < counts[k]; j++) {
      dots.push({ x: xs[k][j], y: yOf(k), leaf: k === depth, key: `${k}-${j}` })
    }
  }

  const edges: Edge[] = []
  for (let k = 0; k < depth; k++) {
    const span = levels[k]
    for (let j = 0; j < counts[k]; j++) {
      for (let c = 0; c < span; c++) {
        edges.push({
          x1: xs[k][j],
          y1: yOf(k),
          x2: xs[k + 1][j * span + c],
          y2: yOf(k + 1),
          key: `${k}-${j}-${c}`,
        })
      }
    }
  }

  return { root: { x: xs[0][0], y: ROOT_CY }, dots, edges }
}

function CaseTree({
  data,
  combined,
  showBranches,
}: {
  data: CaseData
  combined: boolean
  showBranches: boolean
}): React.JSX.Element {
  const { root, dots, edges } = useMemo(() => buildTree(data.factors), [data.factors])

  return (
    <div className={`cwtree ${combined ? 'is-combined' : ''} ${showBranches ? '' : 'cwtree--seed'}`}>
      <svg
        className="cwtree__wires"
        viewBox={`0 0 ${TREE_W} ${TREE_H}`}
        width={TREE_W}
        height={TREE_H}
        aria-hidden="true"
      >
        {showBranches && (
          <g className="cwtree__branches">
            {edges.map((e) => (
              <line key={e.key} className="cwtree__edge" x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} />
            ))}
            {dots.map((d) => (
              <circle
                key={d.key}
                className={d.leaf ? 'cwtree__leaf' : 'cwtree__hub'}
                cx={d.x}
                cy={d.y}
                r={d.leaf ? 6 : 7}
              />
            ))}
          </g>
        )}
      </svg>

      <div className="cwtree__root" style={{ left: root.x, top: root.y }}>
        <span className="cwtree__emoji">{data.emoji}</span>
        <span className="cwtree__name">{data.label}</span>
      </div>
    </div>
  )
}

export function CaseworkTrees({
  config,
  revealedCount,
  combined,
  asking = false,
}: {
  config: CaseworkTreesConfig
  revealedCount: number
  combined: boolean
  // When true, the next unanswered case shows its node only (branches grow in once answered).
  asking?: boolean
}): React.JSX.Element {
  const { parentLabel, cases } = config
  const n = cases.length
  const shown = Math.max(0, Math.min(revealedCount, n))
  const rowW = n > 0 ? n * TREE_W + (n - 1) * GAP : TREE_W
  const canvasH = PARENT_BAND + TREE_H
  const showParent = combined && shown > 0

  const rootX = (i: number) => i * (TREE_W + GAP) + TREE_W / 2

  return (
    <div className="cwtrees">
      <div className="cwtrees__canvas" style={{ width: rowW, height: canvasH }}>
        <svg
          className="cwtrees__links"
          viewBox={`0 0 ${rowW} ${canvasH}`}
          width={rowW}
          height={canvasH}
          aria-hidden="true"
        >
          {showParent &&
            cases.slice(0, shown).map((c, i) => (
              <line
                key={c.id}
                className="cwtrees__link"
                x1={rowW / 2}
                y1={PARENT_CY + 20}
                x2={rootX(i)}
                y2={PARENT_BAND + ROOT_CY - 22}
              />
            ))}
        </svg>

        {showParent && (
          <div className="cwtrees__parent" style={{ left: rowW / 2, top: PARENT_CY }}>
            <span className="cwtrees__parent-name">{parentLabel}</span>
          </div>
        )}

        <div className="cwtrees__row" style={{ top: PARENT_BAND, gap: GAP }}>
          {cases.map((c, i) => {
            if (i < shown) return <CaseTree key={c.id} data={c} combined={combined} showBranches />
            if (i === shown && asking)
              return <CaseTree key={c.id} data={c} combined={combined} showBranches={false} />
            return <div key={c.id} className="cwtree cwtree--ghost" aria-hidden="true" />
          })}
        </div>
      </div>
    </div>
  )
}
