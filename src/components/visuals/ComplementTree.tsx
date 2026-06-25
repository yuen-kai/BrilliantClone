import { useState } from 'react'
import './ComplementTree.css'

export type ComplementTreeConfig = {
  rootLabel: string
  branches: { id: string; label: string; count: number; wanted: boolean }[]
}

type Mode = 'direct' | 'complement'

// The three CAD-style "selection" operations a node can be in. `recede` is the
// de-emphasised, unselected look (faded / calmed into the whole).
type Op = 'add' | 'subtract' | 'recede'

// One SVG coordinate space so edges always meet nodes and the whole tree scales together.
const W = 564
const H = 224
const PAD_X = 14
const ROOT_W = 168
const ROOT_H = 46
const ROOT_CX = W / 2
const ROOT_TOP = 16
const ROOT_BOTTOM = ROOT_TOP + ROOT_H
const LEAF_TOP = 156
const LEAF_H = 44

function leafOp(mode: Mode, wanted: boolean): Op {
  if (mode === 'direct') return wanted ? 'add' : 'recede'
  return wanted ? 'recede' : 'subtract'
}

export function ComplementTree({ config }: { config: ComplementTreeConfig }): React.JSX.Element {
  const [mode, setMode] = useState<Mode>('direct')
  const { rootLabel, branches } = config

  const dense = branches.length > 6
  const labelFont = dense ? 11 : 13

  const slotW = (W - PAD_X * 2) / branches.length
  const leafW = Math.min(slotW - 8, 104)

  // Sequential index among the leaves that get "added" in direct mode — drives the
  // staggered light-up so gathering many branches one-by-one feels like real work.
  let addOrder = -1
  const leaves = branches.map((b, i) => {
    const cx = PAD_X + slotW * (i + 0.5)
    const op = leafOp(mode, b.wanted)
    const weighIndex = op === 'add' ? ++addOrder : 0
    return { ...b, cx, left: cx - leafW / 2, op, weighIndex }
  })

  const wantedCount = branches.filter((b) => b.wanted).length
  const unwantedCount = branches.length - wantedCount
  // In complement mode the root is the body you cut from — the "subtract from" selection.
  const rootSelected = mode === 'complement'

  return (
    <div className={`ctree ctree--${mode}`}>
      <svg
        className="ctree__canvas"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${rootLabel}, split into ${branches.length} cases: ${branches
          .map((b) => b.label)
          .join(', ')}`}
      >
        <rect className="ctree__wash" x={4} y={4} width={W - 8} height={H - 8} rx={16} />

        {leaves.map((l) => (
          <line
            key={`edge-${l.id}`}
            className={`ctree__edge is-${l.op}`}
            x1={ROOT_CX}
            y1={ROOT_BOTTOM}
            x2={l.cx}
            y2={LEAF_TOP}
          />
        ))}

        <g className={`ctree__root ${rootSelected ? 'is-subtract-from' : ''}`}>
          <rect
            className="ctree__root-box"
            x={ROOT_CX - ROOT_W / 2}
            y={ROOT_TOP}
            width={ROOT_W}
            height={ROOT_H}
            rx={12}
          />
          <text className="ctree__root-label" x={ROOT_CX} y={ROOT_TOP + ROOT_H / 2}>
            {rootLabel}
          </text>
        </g>

        {leaves.map((l) => (
          <g
            key={`leaf-${l.id}`}
            className={`ctree__leaf is-${l.op}`}
            style={{ ['--w' as string]: l.weighIndex } as React.CSSProperties}
          >
            <rect
              className="ctree__leaf-box"
              x={l.left}
              y={LEAF_TOP}
              width={leafW}
              height={LEAF_H}
              rx={11}
            />
            <text
              className="ctree__leaf-label"
              x={l.cx}
              y={LEAF_TOP + LEAF_H / 2}
              style={{ fontSize: labelFont }}
            >
              {l.label}
            </text>
            {l.op === 'subtract' && (
              <g
                className="ctree__remove"
                transform={`translate(${l.left + leafW - 7} ${LEAF_TOP + 7})`}
              >
                <circle className="ctree__remove-dot" r={8.5} />
                <line className="ctree__remove-x" x1={-4} y1={0} x2={4} y2={0} />
              </g>
            )}
          </g>
        ))}
      </svg>

      <div className="ctree__toggle" role="group" aria-label="counting strategy">
        <button
          type="button"
          className={`ctree__tab ${mode === 'direct' ? 'is-active' : ''}`}
          aria-pressed={mode === 'direct'}
          onClick={() => setMode('direct')}
        >
          Count directly
        </button>
        <button
          type="button"
          className={`ctree__tab ${mode === 'complement' ? 'is-active' : ''}`}
          aria-pressed={mode === 'complement'}
          onClick={() => setMode('complement')}
        >
          Use the complement
        </button>
      </div>

      <p className="ctree__caption">
        {mode === 'direct'
          ? `Add up every wanted branch — all ${wantedCount} of them.`
          : `Take the whole, then subtract the ${unwantedCount} unwanted branch.`}
      </p>

      <div className="ctree__legend" aria-hidden="true">
        {mode === 'direct' ? (
          <span className="ctree__key ctree__key--add">Add — wanted branches</span>
        ) : (
          <>
            <span className="ctree__key ctree__key--from">Subtract from — the whole</span>
            <span className="ctree__key ctree__key--subtract">Subtract — unwanted branch</span>
          </>
        )}
      </div>
    </div>
  )
}
