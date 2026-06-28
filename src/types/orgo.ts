/**
 * Types for the "Substitution & Elimination" organic-chemistry course (lessons
 * `oc-1`…`oc-6`). This is a self-contained course: one flexible step type
 * (`orgo`) drives a manipulable chemistry visual, then asks gated questions
 * (numeric or multiple-choice) one at a time. The configs below are the single
 * source of truth shared by the lesson content and the widgets that render it.
 *
 * Color semantics are consistent across every widget:
 *   --accent  electron-rich · nucleophile · lone pairs · the curved arrow itself
 *   --sky     electron-poor · electrophile · δ+
 *   --ember   leaving group (what departs with the electrons)
 *   --grow    a bond that just formed / a "solved" success state
 *   --flag    blocked / illegal move only
 */
import type { ChoiceOption, FeedbackWrong } from './lesson'

// ---------------------------------------------------------------------------
// Gates: a question asked after (or alongside) the interaction. Numeric blanks
// reuse the math GateInput; choice blanks reuse ChoiceInput. Discriminate with
// `'options' in gate`.
// ---------------------------------------------------------------------------

export type OrgoNumberGate = {
  id: string
  label: string
  prompt: string
  correctValue: number
  hintText?: string
  feedbackWrong: FeedbackWrong
  /** Shown on the confirmed row once solved, e.g. "2 e⁻ per arrow". */
  revealExpression?: string
}

export type OrgoChoiceGate = {
  id: string
  label: string
  prompt: string
  options: ChoiceOption[]
  correctId: string
  feedback: { wrong: string; byOption?: Record<string, string> }
  hintText?: string
}

export type OrgoGate = OrgoNumberGate | OrgoChoiceGate

export const isChoiceGate = (gate: OrgoGate): gate is OrgoChoiceGate => 'options' in gate

// ---------------------------------------------------------------------------
// Shared molecular primitives (used by the curved-arrow canvas). x,y live in a
// 0…STAGE square (STAGE = 300 in chemKit).
// ---------------------------------------------------------------------------

export type ChemRole = 'nucleophile' | 'electrophile' | 'leaving' | 'plain'

export type ChemAtom = {
  id: string
  label: string
  x: number
  y: number
  charge?: number
  /** Number of lone pairs to draw as dot-pairs around the atom. */
  lonePairs?: number
  /** Partial-charge badge. */
  delta?: 'plus' | 'minus'
  role?: ChemRole
}

export type ChemBond = { id: string; a: string; b: string; order?: 1 | 2 | 3 }

/** A legal endpoint for a curved arrow: a tail sits on electrons (a lone pair
 * or a bond); a head points at the electrophilic atom or the bond that breaks. */
export type ArrowSite = {
  id: string
  kind: 'lone-pair' | 'bond' | 'atom'
  /** Atom (or bond) id this site decorates, for positioning + bookkeeping. */
  on: string
  x: number
  y: number
}

/** One arrow the learner must draw: tail site id → head site id. */
export type ArrowSpec = { id: string; from: string; to: string }

/** L1 — the curved-arrow canvas. Drag double-barbed arrows from electron
 * sources to electrophilic sites; the correct set forms the product. */
export type ArrowPushConfig = {
  atoms: ChemAtom[]
  bonds: ChemBond[]
  tails: ArrowSite[]
  heads: ArrowSite[]
  solution: ArrowSpec[]
  /** Bonds that animate in once solved. */
  formBonds?: { a: string; b: string }[]
  /** Bond ids that break (drawn fading) once solved. */
  breakBonds?: string[]
  /** Atom that ejects as a leaving group once solved. */
  leavingId?: string
  hint?: string
  caption?: string
}

// ---------------------------------------------------------------------------
// L2 — SN2 backside attack. A tetrahedral centre; the nucleophile must approach
// ~180° from the leaving group (backside) to react, and the centre inverts.
// ---------------------------------------------------------------------------

export type SubstrateClass = 'methyl' | '1°' | '2°' | '3°'

export type BacksideAttackConfig = {
  /** The three non-leaving substituents around the carbon. */
  groups: [string, string, string]
  leavingGroup: string
  nucleophile: string
  /** Half-angle (deg) of the backside cone that counts as a hit. Default ~45. */
  backsideToleranceDeg?: number
  /** Sterics selector: each class shrinks the opening and sets a relative rate. */
  classes?: { id: SubstrateClass; label: string; relRate: number }[]
  caption?: string
}

// ---------------------------------------------------------------------------
// L3 — SN1. The leaving group departs first → a flat (sp²) carbocation, which
// the nucleophile can hit from either face → a 50/50 racemic mixture.
// ---------------------------------------------------------------------------

export type CarbocationFacesConfig = {
  groups: [string, string, string]
  leavingGroup: string
  nucleophile: string
  caption?: string
}

// ---------------------------------------------------------------------------
// L4 — E2. A Newman projection; rotate the back carbon until a β-H is
// anti-periplanar (≈180°) to the leaving group, then the base eliminates.
// ---------------------------------------------------------------------------

export type NewmanSub = { label: string; lg?: boolean; betaH?: boolean }

export type NewmanDialConfig = {
  base: string
  /** Front-carbon substituents at 12/4/8 o'clock; exactly one is the LG. */
  front: NewmanSub[]
  /** Back-carbon substituents at 6/10/2 o'clock; mark removable β-hydrogens. */
  back: NewmanSub[]
  /** Tolerance (deg) around 180° that counts as anti-periplanar. Default ~25. */
  antiToleranceDeg?: number
  caption?: string
}

// ---------------------------------------------------------------------------
// L5 — E1. Ionize to a carbocation, then a base removes a β-H. Two different
// β-carbons give different alkenes; the more substituted one (Zaitsev) wins.
// ---------------------------------------------------------------------------

export type BetaOption = {
  id: string
  label: string
  /** Substitution count of the resulting alkene (higher = more stable). */
  substitution: number
  /** The more-substituted (major) product. */
  zaitsev?: boolean
}

export type E1RouteConfig = {
  leavingGroup: string
  base: string
  betaOptions: BetaOption[]
  caption?: string
}

// ---------------------------------------------------------------------------
// L6 — Choosing the pathway. Dial substrate / reagent / heat and watch the
// predicted mechanism (SN1/SN2/E1/E2) update live.
// ---------------------------------------------------------------------------

export type Mechanism = 'SN1' | 'SN2' | 'E1' | 'E2'

export type PathwayConsoleConfig = {
  /** A scenario to match (sets onSolved when the prediction lands on it). */
  target?: { substrate: SubstrateClass; reagent: string; heat: boolean; mechanism: Mechanism }
  caption?: string
}

// ---------------------------------------------------------------------------

export type OrgoVisual =
  | { component: 'arrow-push'; config: ArrowPushConfig }
  | { component: 'backside-attack'; config: BacksideAttackConfig }
  | { component: 'carbocation-faces'; config: CarbocationFacesConfig }
  | { component: 'newman-dial'; config: NewmanDialConfig }
  | { component: 'e1-route'; config: E1RouteConfig }
  | { component: 'pathway-console'; config: PathwayConsoleConfig }

/**
 * The course's one custom step: a manipulable visual the learner drives, then
 * gated questions revealed one at a time. With `gateOnSolved`, the questions
 * stay hidden until the widget reports the interaction is complete.
 */
export type OrgoStep = {
  id: string
  step: number
  type: 'orgo'
  prompt: string
  visual?: OrgoVisual
  gateOnSolved?: boolean
  /** Override the "drive the reaction to continue" nudge under a gated visual. */
  gateOnSolvedHint?: string
  gates: OrgoGate[]
}
