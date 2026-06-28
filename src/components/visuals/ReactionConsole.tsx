import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactionConsoleConfig } from '../../types/lesson'
import './ReactionConsole.css'

type Klass = ReactionConsoleConfig['substrate']['klass']
type Control = ReactionConsoleConfig['controls'][number]
type ReagentRole = NonNullable<ReactionConsoleConfig['reagents']>[number]['role']
type Solvent = 'protic' | 'aprotic'
type Heat = 'cool' | 'hot'
type Mechanism = 'SN1' | 'SN2' | 'E1' | 'E2'

const KLASSES: Klass[] = ['methyl', '1°', '2°', '3°']
/** Carbons on the α-carbon per class; the remaining 3 slots are hydrogens. */
const R_COUNT: Record<Klass, number> = { methyl: 0, '1°': 1, '2°': 2, '3°': 3 }
const KLASS_SUB: Record<Klass, string> = {
  methyl: 'CH₃–Br · 0 carbons',
  '1°': '1 carbon on the α-C',
  '2°': '2 carbons on the α-C',
  '3°': '3 carbons on the α-C',
}
/** The molecule `Skeleton` actually draws per class (α-C + methyls + Br). */
const KLASS_NAME: Record<Klass, string> = {
  methyl: 'bromomethane',
  '1°': 'bromoethane',
  '2°': '2-bromopropane',
  '3°': '2-bromo-2-methylpropane',
}

/**
 * The favored mechanism for a *fully specified* set of conditions. Kept entirely
 * internal — mirrors the lesson's gate answers so the console stays chemically
 * honest, but is never shown before the learner commits (it only feeds an
 * invisible `data-mechanism` hook after the conditions are locked in).
 */
function predictMechanism(
  klass: Klass,
  role: ReagentRole | null,
  solvent: Solvent | null,
  heat: Heat | null,
): Mechanism | null {
  const hot = heat === 'hot'
  // Unhindered carbons can't hold a + charge → no SN1/E1. SN2 unless a bulky
  // base is too fat to attack and rips a β-H instead (E2).
  if (klass === 'methyl' || klass === '1°') {
    if (role === 'strong-bulky-base') return 'E2'
    if (role == null) return null
    return 'SN2'
  }
  // 3° is too crowded for SN2 → it ionizes. A strong base eliminates (E2);
  // otherwise the carbocation is captured (SN1, cool) or sheds a β-H (E1, hot).
  if (klass === '3°') {
    if (role === 'strong-bulky-base' || role === 'strong-small-base') return 'E2'
    if (solvent == null || heat == null) return null
    return hot ? 'E1' : 'SN1'
  }
  // 2° — the swing class; the reagent and conditions break the tie.
  if (role == null || solvent == null) return null
  if (role === 'strong-bulky-base') return 'E2'
  if (role === 'strong-small-base') return hot ? 'E2' : 'SN2'
  if (role === 'strong-nu') return 'SN2' // strong nucleophile / weak base → substitution
  return hot ? 'E1' : 'SN1' // weak-neutral → carbocation route
}

function Skeleton({ klass }: { klass: Klass }) {
  const cx = 64
  const cy = 56
  const r = 27
  const lr = r + 16
  const rCount = R_COUNT[klass]
  // Upper-left, left, lower-left (math degrees); carbons fill first, then H.
  const subs = [120, 180, 240].map((deg, i) => {
    const rad = (deg * Math.PI) / 180
    const isR = i < rCount
    return {
      bx: cx + r * Math.cos(rad),
      by: cy - r * Math.sin(rad),
      lx: cx + lr * Math.cos(rad),
      ly: cy - lr * Math.sin(rad),
      label: isR ? 'CH₃' : 'H',
      isR,
    }
  })
  return (
    <svg className="rxn__mol" viewBox="0 0 150 116" role="img" aria-label={`${klass} substrate`}>
      <line className="rxn__bond" x1={cx} y1={cy} x2={cx + r} y2={cy} />
      {subs.map((s, i) => (
        <line className="rxn__bond" key={i} x1={cx} y1={cy} x2={s.bx} y2={s.by} />
      ))}
      {subs.map((s, i) => (
        <text className={`rxn__sub ${s.isR ? 'is-r' : 'is-h'}`} key={i} x={s.lx} y={s.ly}>
          {s.label}
        </text>
      ))}
      <text className="rxn__lg" x={cx + lr + 4} y={cy}>
        Br
      </text>
      <circle className="rxn__c-dot" cx={cx} cy={cy} r={11} />
      <text className="rxn__c" x={cx} y={cy}>
        C
      </text>
    </svg>
  )
}

/**
 * The L6 capstone "reaction bench": dial in the conditions — substrate class,
 * reagent, solvent and temperature (only the controls listed for this step are
 * live) — and the console reports `onSolved` once every live control is set to a
 * definite value. The mechanism + product stay blank ("?") on purpose; the
 * lesson's gates do the asking, so nothing is given away before the commit.
 */
export function ReactionConsole({
  config,
  onSolved,
}: {
  config: ReactionConsoleConfig
  onSolved?: () => void
}) {
  const { substrate, controls, reagents = [], caption } = config
  const has = (c: Control) => controls.includes(c)

  // When the dial is live, start at `methyl` (not the answer) so spinning to the
  // target is a real gesture; otherwise lock to the step's fixed substrate.
  const [klass, setKlass] = useState<Klass>(has('substrate') ? 'methyl' : substrate.klass)
  const [substrateTouched, setSubstrateTouched] = useState(false)
  const [reagentId, setReagentId] = useState<string | null>(null)
  const [solvent, setSolvent] = useState<Solvent | null>(null)
  const [heat, setHeat] = useState<Heat | null>(null)

  const role = useMemo<ReagentRole | null>(
    () => reagents.find((r) => r.id === reagentId)?.role ?? null,
    [reagents, reagentId],
  )
  const reagentLabel = reagents.find((r) => r.id === reagentId)?.label ?? null

  const engaged = (c: Control) =>
    c === 'substrate'
      ? substrateTouched
      : c === 'reagent'
        ? reagentId != null
        : c === 'solvent'
          ? solvent != null
          : heat != null

  const complete = controls.every(engaged)
  const nextControl = controls.find((c) => !engaged(c)) ?? null
  const outcome = predictMechanism(klass, role, solvent, heat)

  const solvedRef = useRef(false)
  const [solved, setSolved] = useState(false)
  useEffect(() => {
    if (complete && !solvedRef.current) {
      solvedRef.current = true
      setSolved(true)
      const t = setTimeout(() => onSolved?.(), 500)
      return () => clearTimeout(t)
    }
  }, [complete, onSolved])

  // --- reagent bottle → flask drag (pointer events, like RoundTable) ---------
  const [drag, setDrag] = useState<{ id: string; x: number; y: number; over: boolean } | null>(null)
  const overFlask = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y)
    return el instanceof Element && !!el.closest('[data-flask]')
  }
  const startBottle = (id: string, e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag({ id, x: e.clientX, y: e.clientY, over: false })
  }
  const moveBottle = (e: React.PointerEvent) => {
    setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY, over: overFlask(e.clientX, e.clientY) } : d))
  }
  const endBottle = (e: React.PointerEvent) => {
    if (!drag) return
    const landed = overFlask(e.clientX, e.clientY)
    const id = drag.id
    setDrag(null)
    if (landed) setReagentId(id)
  }

  // --- temperature lever (draggable knob, snaps to cool/hot on release) -------
  const leverRef = useRef<HTMLDivElement>(null)
  const [leverPos, setLeverPos] = useState<number | null>(null)
  const leverFrac = (clientX: number) => {
    const rect = leverRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return 0.5
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  }
  const startLever = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setLeverPos(leverFrac(e.clientX))
  }
  const moveLever = (e: React.PointerEvent) => {
    setLeverPos((p) => (p == null ? p : leverFrac(e.clientX)))
  }
  const endLever = (e: React.PointerEvent) => {
    if (leverPos == null) return
    const p = leverFrac(e.clientX)
    setLeverPos(null)
    setHeat(p < 0.5 ? 'cool' : 'hot')
  }
  const knobFrac = leverPos != null ? leverPos : heat === 'cool' ? 0 : heat === 'hot' ? 1 : 0.5

  const pickKlass = (k: Klass) => {
    setKlass(k)
    setSubstrateTouched(true)
  }

  const status = solved
    ? 'Conditions locked in — now predict the mechanism below.'
    : nextControl === 'substrate'
      ? 'Spin the substrate dial to set the carbon class.'
      : nextControl === 'reagent'
        ? 'Drag a reagent bottle into the flask.'
        : nextControl === 'solvent'
          ? 'Pick a solvent: polar protic or polar aprotic.'
          : nextControl === 'heat'
            ? 'Throw the temperature lever: cool or hot.'
            : (caption ?? 'Dial in the conditions.')

  return (
    <div
      className={`rxn ${solved ? 'is-solved' : ''}`}
      data-mechanism={solved && outcome ? outcome : undefined}
    >
      <div className="rxn__bench">
        <div
          className={`rxn__flask ${drag?.over ? 'is-over' : ''} ${
            nextControl === 'reagent' ? 'is-needed' : ''
          }`}
          data-flask
        >
          <span className="rxn__flask-tag">{has('substrate') ? KLASS_NAME[klass] : substrate.label}</span>
          <Skeleton klass={klass} />
          {reagentLabel ? (
            <span className="rxn__added">+ {reagentLabel}</span>
          ) : has('reagent') ? (
            <span className="rxn__drop-hint">drop reagent here</span>
          ) : null}
        </div>

        <div className="rxn__transform">
          <div className="rxn__conds">
            {solvent && <span className="rxn__chip">{solvent === 'protic' ? 'protic' : 'aprotic'}</span>}
            {heat && <span className="rxn__chip">{heat === 'hot' ? '🔥 Δ' : '❄ cool'}</span>}
          </div>
          <span className="rxn__arrow" aria-hidden="true">
            →
          </span>
        </div>

        <div className="rxn__product">
          <span className="rxn__qmark">?</span>
          <span className="rxn__product-cap">product</span>
        </div>
      </div>

      <div className="rxn__verdict">
        <div className="rxn__cell">
          <span className="rxn__cell-k">Mechanism</span>
          <span className="rxn__cell-v">?</span>
        </div>
      </div>

      <div className="rxn__rail">
        {has('substrate') && (
          <div className={`rxn__control ${nextControl === 'substrate' ? 'is-needed' : ''}`}>
            <span className="rxn__control-label">Substrate</span>
            <div className="rxn__dial" role="group" aria-label="Substrate class">
              {KLASSES.map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`rxn__dial-seg ${klass === k ? 'is-on' : ''}`}
                  onClick={() => pickKlass(k)}
                >
                  {k}
                </button>
              ))}
            </div>
            <span className="rxn__control-sub">{KLASS_SUB[klass]}</span>
          </div>
        )}

        {has('reagent') && (
          <div className={`rxn__control ${nextControl === 'reagent' ? 'is-needed' : ''}`}>
            <span className="rxn__control-label">Reagent</span>
            <div className="rxn__tray">
              {reagents.map((rg) => (
                <button
                  key={rg.id}
                  type="button"
                  className={`rxn__bottle ${reagentId === rg.id ? 'is-loaded' : ''} ${
                    drag?.id === rg.id ? 'is-dragging' : ''
                  }`}
                  style={{ touchAction: 'none' }}
                  onPointerDown={(e) => startBottle(rg.id, e)}
                  onPointerMove={moveBottle}
                  onPointerUp={endBottle}
                  onClick={() => setReagentId(rg.id)}
                >
                  <span className="rxn__bottle-emoji" aria-hidden="true">
                    🧪
                  </span>
                  <span className="rxn__bottle-label">{rg.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {has('solvent') && (
          <div className={`rxn__control ${nextControl === 'solvent' ? 'is-needed' : ''}`}>
            <span className="rxn__control-label">Solvent</span>
            <div className={`rxn__switch ${solvent ? 'is-set' : ''}`} role="group" aria-label="Solvent polarity">
              <button
                type="button"
                className={`rxn__switch-opt ${solvent === 'protic' ? 'is-on' : ''}`}
                onClick={() => setSolvent('protic')}
              >
                Polar protic
              </button>
              <button
                type="button"
                className={`rxn__switch-opt ${solvent === 'aprotic' ? 'is-on' : ''}`}
                onClick={() => setSolvent('aprotic')}
              >
                Polar aprotic
              </button>
            </div>
            <span className="rxn__control-sub">
              {solvent == null
                ? 'water/alcohols vs acetone/DMSO'
                : solvent === 'protic'
                  ? 'H-bond donor (e.g. H₂O, EtOH)'
                  : 'no O–H/N–H (e.g. acetone, DMSO)'}
            </span>
          </div>
        )}

        {has('heat') && (
          <div className={`rxn__control ${nextControl === 'heat' ? 'is-needed' : ''}`}>
            <span className="rxn__control-label">Temperature</span>
            <div className="rxn__lever">
              <button
                type="button"
                className={`rxn__lever-end ${heat === 'cool' ? 'is-on' : ''}`}
                onClick={() => setHeat('cool')}
              >
                ❄ cool
              </button>
              <div className="rxn__lever-track" ref={leverRef} style={{ touchAction: 'none' }}>
                <div
                  className={`rxn__lever-knob ${heat == null && leverPos == null ? 'is-unset' : ''}`}
                  style={{ left: `${6 + knobFrac * 88}%` }}
                  onPointerDown={startLever}
                  onPointerMove={moveLever}
                  onPointerUp={endLever}
                />
              </div>
              <button
                type="button"
                className={`rxn__lever-end ${heat === 'hot' ? 'is-on' : ''}`}
                onClick={() => setHeat('hot')}
              >
                🔥 hot
              </button>
            </div>
            <span className="rxn__control-sub">
              {heat == null ? 'room temperature vs Δ (heated)' : heat === 'hot' ? 'heated (Δ)' : 'room temperature'}
            </span>
          </div>
        )}
      </div>

      <p className={`rxn__status ${solved ? 'is-done' : ''}`}>{status}</p>

      {drag && (
        <div className="rxn__ghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          <span className="rxn__bottle-emoji">🧪</span>
          <span className="rxn__bottle-label">{reagents.find((r) => r.id === drag.id)?.label}</span>
        </div>
      )}
    </div>
  )
}
