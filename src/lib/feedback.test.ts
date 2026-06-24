import { describe, expect, it } from 'vitest'
import { resolveFeedback, isCorrectAnswer } from './feedback'
import { validateStageGate } from './lessonEngine'
import type { FeedbackWrong, StageGate } from '../types/lesson'

describe('resolveFeedback', () => {
  const feedback: FeedbackWrong = {
    default: 'Default message',
    specificCases: [{ answer: 7, message: 'You added instead of multiplied.' }],
  }

  it('returns specific case message when answer matches', () => {
    expect(resolveFeedback(7, feedback)).toBe('You added instead of multiplied.')
  })

  it('returns default message when no specific case matches', () => {
    expect(resolveFeedback(12, feedback)).toBe('Default message')
  })
})

describe('isCorrectAnswer', () => {
  it('returns true for matching values', () => {
    expect(isCorrectAnswer(12, 12)).toBe(true)
  })

  it('returns false for non-matching values', () => {
    expect(isCorrectAnswer(7, 12)).toBe(false)
  })
})

describe('validateStageGate', () => {
  const nodeCountStage: StageGate = {
    kind: 'node-count',
    branchCount: 2,
    expectedNodeCount: 6,
  }

  it('validates node-count stage correctly', () => {
    expect(validateStageGate(nodeCountStage, { nodeCount: 6 })).toBe(true)
    expect(validateStageGate(nodeCountStage, { nodeCount: 5 })).toBe(false)
  })

  const dualStage: StageGate = {
    kind: 'dual',
    branchCount: 3,
    expectedMultiplier: 3,
    expectedNodeCount: 18,
  }

  it('validates dual stage correctly', () => {
    expect(validateStageGate(dualStage, { multiplier: 3, nodeCount: 18 })).toBe(true)
    expect(validateStageGate(dualStage, { multiplier: 3, nodeCount: 6 })).toBe(false)
    expect(validateStageGate(dualStage, { multiplier: 2, nodeCount: 18 })).toBe(false)
  })
})
