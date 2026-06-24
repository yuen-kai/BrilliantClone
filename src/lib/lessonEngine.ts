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

export function getExpectedMultiplier(stage: StageGate): number {
  return stage.branchCount
}

export function validateSolveBlank(blank: SolveBlank, value: number): boolean {
  return value === blank.correctValue
}
