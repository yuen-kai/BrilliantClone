import { describe, expect, it } from 'vitest'
import { buildUserMessage, normalizeAssessment, scoreCoverage } from './teachBack'

const keyPoints = ['idea one', 'idea two', 'idea three', 'idea four']

describe('scoreCoverage', () => {
  it('is 0 with nothing correct and 1 with everything correct', () => {
    expect(scoreCoverage(keyPoints, [])).toBe(0)
    expect(scoreCoverage(keyPoints, keyPoints)).toBe(1)
  })

  it('counts a partial subset as a fraction', () => {
    expect(scoreCoverage(keyPoints, ['idea one', 'idea two'])).toBe(0.5)
  })

  it('ignores invented labels and duplicates', () => {
    expect(scoreCoverage(keyPoints, ['idea one', 'idea one', 'made up'])).toBe(0.25)
  })
})

describe('normalizeAssessment', () => {
  it('keeps only real key points and sanitizes the rest', () => {
    const a = normalizeAssessment(
      {
        correct: ['idea one', 'not a real idea'],
        corrections: ['fix the second part', 42],
        message: 'good start',
        solid: true,
      },
      keyPoints,
    )
    expect(a.correct).toEqual(['idea one'])
    expect(a.corrections).toEqual(['fix the second part'])
    expect(a.message).toBe('good start')
    // solid can only be true once every key point is covered.
    expect(a.solid).toBe(false)
  })

  it('honors solid only when all key points are covered', () => {
    const a = normalizeAssessment({ correct: keyPoints, solid: true }, keyPoints)
    expect(a.solid).toBe(true)
  })

  it('tolerates a malformed response', () => {
    const a = normalizeAssessment(null, keyPoints)
    expect(a).toEqual({ correct: [], corrections: [], message: '', solid: false })
  })
})

describe('buildUserMessage', () => {
  it('grounds the request in the concept, key ideas, and the conversation', () => {
    const msg = buildUserMessage(
      { concept: 'casework', keyPoints: ['split into cases', 'add the cases'] },
      [
        { role: 'ai', text: 'teach me' },
        { role: 'learner', text: 'you split and add' },
      ],
    )
    expect(msg).toContain('casework')
    expect(msg).toContain('split into cases')
    expect(msg).toContain('Learner: you split and add')
  })
})
