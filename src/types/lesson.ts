import type { HandshakeConnectConfig } from '../components/visuals/HandshakeConnect'
import type { AnagramBoardConfig } from '../components/visuals/AnagramBoard'
import type { ComplementTreeConfig } from '../components/visuals/ComplementTree'
import type { Op } from '../lib/mathExpr'

export type { Op }

export type FeedbackWrong = {
  default: string
  specificCases: { answer: number; message: string }[]
}

export type TreeLevel = {
  label: string
  branchCount: number
}

export type TreeConfig = {
  levels: TreeLevel[]
}

export type VisualConfig = {
  component: 'tree-build'
  treeConfig: TreeConfig
}

export type StageGate =
  | {
      kind: 'node-count'
      branchCount: number
      expectedNodeCount: number
      multiplierLabel?: string
    }
  | {
      kind: 'dual'
      branchCount: number
      expectedMultiplier: number
      expectedNodeCount: number
    }

export type FinalGate = {
  correctValue: number
  prompt: string
  feedbackWrong: FeedbackWrong
  hintText?: string
}

export type VisualInteractiveStep = {
  id: string
  step: number
  type: 'visual-interactive'
  prompt: string
  visual: VisualConfig
  gated: boolean
  stages: StageGate[]
  finalGate: FinalGate
  hintText: string
  feedbackWrong: FeedbackWrong
}

export type RuleStatementStep = {
  id: string
  step: number
  type: 'rule-statement'
  explanation: string
  /** When set, overlays the named visual-interactive step's tree. Omit for
   * lessons with no tree to point back at. */
  referenceStepId?: string
  overlayExpression?: string
}

export type ColdProblem = {
  id: string
  prompt: string
  correctValue: number
  feedbackWrong: FeedbackWrong
}

export type ColdProblemStep = {
  id: string
  step: number
  type: 'cold-problem'
  problems: ColdProblem[]
}

/**
 * One gated numeric blank in a guided derivation. Blanks are revealed one at a
 * time; each must be answered correctly before the next appears. This is how we
 * make the non-multiplication strategies (divide out overcounts, subtract a
 * complement, add disjoint cases, place stars & bars) interactive without a
 * bespoke visual per lesson.
 */
export type SolveBlank = {
  id: string
  label: string
  prompt: string
  correctValue: number
  hintText?: string
  feedbackWrong: FeedbackWrong
  /** Shown on the confirmed row once solved, e.g. "5 × 4 = 20". */
  revealExpression?: string
}

/** A concrete illustration shown above a guided derivation, so the abstract
 * counting idea is something the learner can see and play with. */
export type ComplementTreeVisual = { component: 'complement-tree' } & ComplementTreeConfig

export type GuidedVisual = ComplementTreeVisual

export type GuidedSolveStep = {
  id: string
  step: number
  type: 'guided-solve'
  prompt: string
  intro?: string
  /** Optional interactive illustration rendered above the worked steps. */
  visual?: GuidedVisual
  blanks: SolveBlank[]
  /** Noun for the final tally, e.g. "ways". */
  resultLabel?: string
}

/**
 * Click-to-fill a counting identity, framed from the concrete thing the learner
 * just did, never from notation they don't know yet. They drop n and k into the
 * slots of one of three templates:
 *   - `permutation`: n! / (n − k)!            (3 slots; `lhs` = "5 × 4 × 3")
 *   - `choose`:      n! / (k! (n − k)!)       (4 slots; `lhs` = "(6 × 5) ÷ (2 × 1)")
 *   - `stars-bars`:  C(n + k − 1, k − 1)      (3 slots; no `lhs`, here n = items,
 *                                              k = groups, and the slots build the
 *                                              stars-and-bars combination directly)
 * The reasoning is structural (which number goes where), not arithmetic; the rule
 * (P/C/stars-bars) is named only on the solved screen, once the learner built it.
 */
export type EquationBuildStep = {
  id: string
  step: number
  type: 'equation-build'
  form: 'permutation' | 'choose' | 'stars-bars'
  /** Whole pool / total positions (perm/choose) — or the items being shared
   * (stars-bars). Fills the numerator / first combination argument. */
  n: number
  /** Picks / chosen group / bars (perm/choose) — or the groups (stars-bars). */
  k: number
  /** Concrete expression the learner already found, shown as the LHS, e.g.
   * "5 × 4 × 3". Omitted for `stars-bars`, which builds the formula itself. */
  lhs?: string
  /** Chip caption for n, e.g. "total objects" or "cookies (items)". */
  nLabel: string
  /** Chip caption for k, e.g. "objects to choose" or "kids (groups)". */
  kLabel: string
  /** One short line framing the build from the concrete result; no notation, no answer. */
  prompt: string
  /** Shown only after solved, e.g. "5! / 2! = 5 × 4 × 3 = 60" or "C(6, 2) = 15". */
  result: string
  /** Named only after solved, e.g. "P(n, k) = n! / (n − k)!". */
  ruleName: string
  /** Render the FactorialSplit(n, k) picture as context (used for permutation builds). */
  showSplit?: boolean
}

/**
 * A whole stars-and-bars problem solved on one screen. The learner sees the
 * scenario as a single "regular" box (a sea of stars with a few movable bars),
 * answers the setup (stars, then bars), watches that one box multiply into many
 * arrangements (so it's clearly a "choose where the bars go" problem), then
 * answers the final count. Everything is derived from the four numbers below, so
 * the lesson data stays tiny; the gates/feedback are generated in the view.
 */
export type StarsBarsSolveStep = {
  id: string
  step: number
  type: 'stars-bars-solve'
  /** One-line scenario, e.g. "Hand out 4 cookies to 3 kids (a kid may get none)." */
  prompt: string
  /** Identical items → stars (n). */
  items: number
  /** Distinct groups → bars = groups − 1 (k − 1). */
  groups: number
  /** Singular nouns; pluralized with a trailing "s" for copy. */
  itemNoun: string
  groupNoun: string
  /** When true, the row's slot count is given (no "Slots" gate): the learner just
   * clicks "Next →" to split. The "Ways to arrange" gate is still asked. */
  slotsGiven?: boolean
  /** When true, the setup is broken into more gates — stars (items), bars
   * (groups − 1), slots (items + bars) — asked one at a time before the row
   * splits, then the "ways" gate. Mutually exclusive with `slotsGiven`. */
  scaffold?: boolean
}

export type SlotItem = {
  id: string
  label: string
  emoji: string
}

/**
 * Discovery steps let the learner manipulate a concrete thing (connect
 * handshakes, spin/rearrange a table, rearrange letters) to *see* the hidden
 * repeats for themselves, then answer the `gates` ("ignoring repeats" then
 * "considering repeats") to derive the count.
 */
export type DiscoveryVisual =
  | { component: 'handshake-connect'; config: HandshakeConnectConfig }
  | { component: 'round-rotations'; seats: SlotItem[] }
  | { component: 'anagram-board'; config: AnagramBoardConfig }

export type DiscoveryStep = {
  id: string
  step: number
  type: 'discovery'
  prompt: string
  visual: DiscoveryVisual
  /**
   * Asked one at a time once the exploration is solved. The scaffold is always
   * the same: first "ignoring repeats" (the naive over-count), then "considering
   * repeats" (the real answer). Reuses SolveBlank so it renders like a ledger.
   */
  gates: SolveBlank[]
}

/**
 * An interactive picker for permutations & combinations. The learner pulls
 * items from a pool into ordered slots (with a roulette-style selection
 * animation). In `permutation` mode they enter how many options remain for each
 * slot; in `combination` mode the picks are auto-animated, then the slot
 * dividers dissolve and the chosen items shuffle in place to show that order no
 * longer matters. `questions` are the gated numeric prompts asked afterwards.
 */
export type SlotSelectStep = {
  id: string
  step: number
  type: 'slot-select'
  mode: 'permutation' | 'combination'
  prompt: string
  intro?: string
  /** Plural noun for the pool items, e.g. "racers". */
  itemNoun: string
  pool: SlotItem[]
  slotLabels: string[]
  /** Show the decision tree growing alongside the picker (used once, to anchor
   * the connection to Lesson 1). */
  showTree?: boolean
  /** Feedback when the per-slot option count is wrong (permutation mode). */
  optionFeedback: FeedbackWrong
  questions: SolveBlank[]
}

/** One case in a casework derivation: a sub-count the learner computes, plus the
 * factors used to auto-draw that case's little decision tree. */
export type CaseworkCase = {
  id: string
  label: string
  emoji: string
  /** Multiplication structure of this case, e.g. [3, 2] → 6 outcomes. */
  factors: number[]
  question: string
  correctValue: number
  revealExpression?: string
  feedbackWrong: FeedbackWrong
}

/**
 * Casework: the learner counts each disjoint case (its tree auto-draws), then
 * combines them under one parent node to *see* that separate cases ADD. No
 * permutation scaffolding — that was learned earlier; here the trees just appear.
 */
export type CaseworkStep = {
  id: string
  step: number
  type: 'casework'
  prompt: string
  /** Node that links the case roots once combined, e.g. "Lunch". */
  parentLabel: string
  cases: CaseworkCase[]
  /** The final "add the cases" gate, shown after the trees combine. */
  total: {
    question: string
    correctValue: number
    revealExpression?: string
    feedbackWrong: FeedbackWrong
  }
}

export type ClassifyScenario = {
  id: string
  /** Concrete word problem. */
  text: string
  answer: 'permutation' | 'combination'
  /** Socratic nudge shown on a wrong pick; must NOT name the answer. */
  hint: string
}

/**
 * Identification practice: the learner reads a word problem and decides whether
 * it's a permutation (order matters) or a combination (order doesn't). One
 * scenario at a time; a wrong pick surfaces the Socratic `hint` without naming
 * the answer, so the learner re-reads and re-decides.
 */
export type ClassifyStep = {
  id: string
  step: number
  type: 'classify'
  /** One short framing line above the scenarios. */
  prompt: string
  scenarios: ClassifyScenario[]
}

export type LessonStep =
  | VisualInteractiveStep
  | RuleStatementStep
  | ColdProblemStep
  | GuidedSolveStep
  | EquationBuildStep
  | SlotSelectStep
  | DiscoveryStep
  | CaseworkStep
  | StarsBarsSolveStep
  | ClassifyStep

export type Lesson = {
  id: string
  title: string
  subject: string
  order: number
  prerequisiteLessonId: string | null
  steps: LessonStep[]
  /** Short hook shown on the lesson's start screen. */
  tagline?: string
  /** Shown when the lesson is mastered. */
  completionMessage?: string
}

export type CourseLesson = {
  id: string
  title: string
  order: number
  prerequisiteLessonId: string | null
}

export type StepAnswers = Record<string, unknown>

export type LessonProgress = {
  currentStepIndex: number
  stepAnswers: StepAnswers
  mastered: boolean | null
  completedAt: string | null
  /** Highest step index the learner has reached. Lets them jump back (via the
   * segmented progress bar) to any step they've already seen. Persisted. */
  furthestStepIndex?: number
}

export type Streak = {
  count: number
  lastActiveDate: string
}

export type UserProfile = {
  name: string
  email: string
  streak: Streak
}
