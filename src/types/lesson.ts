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

/** A concrete, animated illustration shown above a guided derivation. Each
 * variant is self-contained and interactive (e.g. a round table the learner can
 * rotate) so the abstract counting idea is something they can see and play with. */
export type RoundTableVisual = {
  component: 'round-table'
  seats: SlotItem[]
}

export type DuplicateRowVisual = {
  component: 'duplicate-row'
  /** Tiles in display order. Tiles sharing a `groupId` are identical. */
  tiles: { id: string; label: string; groupId: string }[]
  word: string
}

export type ComplementDotsVisual = {
  component: 'complement-dots'
  total: number
  unwanted: number
  wantedLabel: string
  unwantedLabel: string
}

export type StarsBarsVisual = {
  component: 'stars-bars'
  stars: number
  bars: number
  groupNoun: string
}

export type GuidedVisual =
  | RoundTableVisual
  | DuplicateRowVisual
  | ComplementDotsVisual
  | StarsBarsVisual

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

export type SlotItem = {
  id: string
  label: string
  emoji: string
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

export type LessonStep =
  | VisualInteractiveStep
  | RuleStatementStep
  | ColdProblemStep
  | GuidedSolveStep
  | SlotSelectStep

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
