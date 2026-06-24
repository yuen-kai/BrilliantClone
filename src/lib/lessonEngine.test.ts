import { describe, expect, it } from 'vitest'
import { validateSolveBlank, validateStageGate } from './lessonEngine'
import type { SolveBlank, StageGate } from '../types/lesson'

describe('validateStageGate (Layer 1)', () => {
  it('gates node-count stages (Steps 1 & 3)', () => {
    const stage: StageGate = {
      kind: 'node-count',
      branchCount: 2,
      expectedNodeCount: 6,
    }
    expect(validateStageGate(stage, { nodeCount: 6 })).toBe(true)
    expect(validateStageGate(stage, { nodeCount: 5 })).toBe(false)
  })

  it('gates dual-input stages (Step 2)', () => {
    const stage: StageGate = {
      kind: 'dual',
      branchCount: 3,
      expectedMultiplier: 3,
      expectedNodeCount: 18,
    }
    expect(validateStageGate(stage, { multiplier: 3, nodeCount: 18 })).toBe(true)
    expect(validateStageGate(stage, { multiplier: 3, nodeCount: 6 })).toBe(false)
  })
})

describe('validateSolveBlank (guided derivations)', () => {
  const blank: SolveBlank = {
    id: 'divide',
    label: 'Actual pairs',
    prompt: '20 ÷ 2?',
    correctValue: 10,
    feedbackWrong: { default: 'Divide by 2.', specificCases: [] },
  }

  it('accepts the exact answer and rejects anything else', () => {
    expect(validateSolveBlank(blank, 10)).toBe(true)
    expect(validateSolveBlank(blank, 20)).toBe(false)
    expect(validateSolveBlank(blank, 0)).toBe(false)
  })
})
