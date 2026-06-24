import { describe, expect, it } from 'vitest'
import { lessons, availableLessonIds } from './lessons'
import { courseLessons } from './course'
import type { Lesson } from '../types/lesson'

const allLessons = Object.values(lessons)

/** Evaluate a simple left-to-right arithmetic string like "5 × 4 = 20".
 * Returns the computed left-hand side, or null if the expression isn't pure
 * arithmetic (factorials, C(n,k), prose, parentheses are skipped). */
function evalSimpleExpression(expr: string): { value: number; target: number } | null {
  if (!/^\d+(\s[×÷+\-−]\s\d+)+\s=\s\d+$/.test(expr)) return null
  const [lhs, rhs] = expr.split('=').map((s) => s.trim())
  const tokens = lhs.split(/\s+/)
  let acc = Number(tokens[0])
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i]
    const n = Number(tokens[i + 1])
    if (op === '×') acc *= n
    else if (op === '÷') acc /= n
    else if (op === '+') acc += n
    else if (op === '−' || op === '-') acc -= n
    else return null
  }
  return { value: acc, target: Number(rhs) }
}

describe('lesson content registry', () => {
  it('has content for every lesson on the course path', () => {
    for (const cl of courseLessons) {
      expect(availableLessonIds.has(cl.id), `missing content for ${cl.id}`).toBe(true)
      expect(lessons[cl.id].title).toBe(cl.title)
      expect(lessons[cl.id].order).toBe(cl.order)
    }
  })

  it('has a valid prerequisite chain', () => {
    for (const cl of courseLessons) {
      if (cl.prerequisiteLessonId) {
        expect(availableLessonIds.has(cl.prerequisiteLessonId)).toBe(true)
      }
    }
  })
})

describe.each(allLessons.map((l) => [l.id, l] as const))('lesson %s structure', (_, lesson: Lesson) => {
  it('numbers its steps sequentially from 1', () => {
    lesson.steps.forEach((step, i) => {
      expect(step.step).toBe(i + 1)
    })
  })

  it('has unique step ids', () => {
    const ids = lesson.steps.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps tree gates consistent with the running product', () => {
    for (const step of lesson.steps) {
      if (step.type !== 'visual-interactive') continue
      const levels = step.visual.treeConfig.levels
      expect(step.stages.length).toBe(levels.length)

      let running = 1
      step.stages.forEach((stage, i) => {
        running *= levels[i].branchCount
        expect(stage.branchCount).toBe(levels[i].branchCount)
        expect(stage.expectedNodeCount).toBe(running)
        if (stage.kind === 'dual') {
          expect(stage.expectedMultiplier).toBe(levels[i].branchCount)
        }
      })

      expect(Number.isInteger(step.finalGate.correctValue)).toBe(true)
      expect(step.finalGate.correctValue).toBeGreaterThan(0)
    }
  })

  it('points rule references at real tree steps', () => {
    for (const step of lesson.steps) {
      if (step.type !== 'rule-statement' || !step.referenceStepId) continue
      const target = lesson.steps.find((s) => s.id === step.referenceStepId)
      expect(target, `${step.id} → ${step.referenceStepId}`).toBeDefined()
      expect(target?.type).toBe('visual-interactive')
    }
  })

  it('has well-formed guided-solve blanks with correct arithmetic', () => {
    for (const step of lesson.steps) {
      if (step.type !== 'guided-solve') continue
      expect(step.blanks.length).toBeGreaterThan(0)
      for (const blank of step.blanks) {
        expect(Number.isInteger(blank.correctValue)).toBe(true)
        if (blank.revealExpression) {
          const parsed = evalSimpleExpression(blank.revealExpression)
          if (parsed) {
            expect(parsed.value, `${blank.id}: ${blank.revealExpression}`).toBe(parsed.target)
            expect(parsed.target).toBe(blank.correctValue)
          }
        }
      }
    }
  })

  it('has well-formed guided-solve visuals', () => {
    for (const step of lesson.steps) {
      if (step.type !== 'guided-solve' || !step.visual) continue
      const v = step.visual
      if (v.component === 'round-table') {
        expect(v.seats.length).toBeGreaterThanOrEqual(3)
        expect(new Set(v.seats.map((s) => s.id)).size).toBe(v.seats.length)
      } else if (v.component === 'stars-bars') {
        expect(v.stars).toBeGreaterThan(0)
        expect(v.bars).toBeGreaterThan(0)
      } else if (v.component === 'complement-dots') {
        expect(v.unwanted).toBeGreaterThanOrEqual(0)
        expect(v.unwanted).toBeLessThanOrEqual(v.total)
      } else if (v.component === 'duplicate-row') {
        const sizes = v.tiles.reduce<Record<string, number>>((m, t) => {
          m[t.groupId] = (m[t.groupId] ?? 0) + 1
          return m
        }, {})
        expect(Object.values(sizes).some((c) => c > 1)).toBe(true)
      }
    }
  })

  it('has well-formed slot-select steps with correct arithmetic', () => {
    for (const step of lesson.steps) {
      if (step.type !== 'slot-select') continue
      expect(['permutation', 'combination']).toContain(step.mode)
      expect(step.pool.length).toBeGreaterThanOrEqual(step.slotLabels.length)
      expect(new Set(step.pool.map((p) => p.id)).size).toBe(step.pool.length)
      expect(step.questions.length).toBeGreaterThan(0)
      for (const q of step.questions) {
        expect(Number.isInteger(q.correctValue)).toBe(true)
        if (q.revealExpression) {
          const parsed = evalSimpleExpression(q.revealExpression)
          if (parsed) {
            expect(parsed.value, `${q.id}: ${q.revealExpression}`).toBe(parsed.target)
            expect(parsed.target).toBe(q.correctValue)
          }
        }
      }
    }
  })

  it('has well-formed cold problems', () => {
    for (const step of lesson.steps) {
      if (step.type !== 'cold-problem') continue
      expect(step.problems.length).toBeGreaterThan(0)
      for (const problem of step.problems) {
        expect(Number.isInteger(problem.correctValue)).toBe(true)
        expect(problem.correctValue).toBeGreaterThan(0)
      }
    }
  })
})
