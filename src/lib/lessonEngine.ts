import type { SolveBlank, StageGate } from '../types/lesson'

export function validateStageGate(
  stage: StageGate,
  answers: { multiplier?: number; nodeCount?: number },
): boolean {
  if (stage.kind === 'node-count') {
    return answers.nodeCount === stage.expectedNodeCount
  }
  return (
    answers.multiplier === stage.expectedMultiplier &&
    answers.nodeCount === stage.expectedNodeCount
  )
}

export function validateSolveBlank(blank: SolveBlank, value: number): boolean {
  return value === blank.correctValue
}

/** n choose k, computed without overflowing for the small values lessons use. */
export function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  const j = Math.min(k, n - k)
  let result = 1
  for (let i = 0; i < j; i++) {
    result = (result * (n - i)) / (i + 1)
  }
  return Math.round(result)
}
