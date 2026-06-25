import { describe, expect, it } from 'vitest'
import { lessons, availableLessonIds } from './lessons'
import { courseLessons } from './course'
import { choose } from '../lib/lessonEngine'
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
      if (v.component === 'complement-tree') {
        expect(v.branches.length).toBeGreaterThanOrEqual(2)
        // Exactly the complement strategy: at least one wanted and one unwanted branch.
        expect(v.branches.some((b) => b.wanted)).toBe(true)
        expect(v.branches.some((b) => !b.wanted)).toBe(true)
      }
    }
  })

  it('has well-formed equation-build steps', () => {
    const permute = (n: number, k: number) => {
      let p = 1
      for (let i = 0; i < k; i++) p *= n - i
      return p
    }
    for (const step of lesson.steps) {
      if (step.type !== 'equation-build') continue
      expect(['permutation', 'choose', 'stars-bars']).toContain(step.form)
      expect(step.k).toBeGreaterThan(0)
      // choose needs a non-empty complement (n > k); permutation allows n = k;
      // stars-bars uses n = items (≥ 1) and k = groups (≥ 2, so ≥ 1 bar).
      if (step.form === 'choose') {
        expect(step.n).toBeGreaterThan(step.k)
      } else if (step.form === 'permutation') {
        expect(step.n).toBeGreaterThanOrEqual(step.k)
      } else {
        expect(step.n).toBeGreaterThan(0)
        expect(step.k).toBeGreaterThanOrEqual(2)
      }
      // lhs frames perm/choose from a concrete product; stars-bars omits it.
      const texts = [step.nLabel, step.kLabel, step.prompt, step.result, step.ruleName]
      if (step.form !== 'stars-bars') texts.push(step.lhs ?? '')
      for (const text of texts) {
        expect(text.length).toBeGreaterThan(0)
      }
      // The number the result lands on must be the real count it claims to build.
      // For stars-bars that's the formula C(n + k − 1, k − 1).
      const expected =
        step.form === 'choose'
          ? choose(step.n, step.k)
          : step.form === 'permutation'
            ? permute(step.n, step.k)
            : choose(step.n + step.k - 1, step.k - 1)
      const lastNum = step.result.match(/(\d+)\s*$/)
      expect(lastNum, `${step.id}: result must end in a number`).not.toBeNull()
      expect(Number(lastNum?.[1]), `${step.id}: ${step.result}`).toBe(expected)
    }
  })

  it('has well-formed stars-bars-solve steps', () => {
    for (const step of lesson.steps) {
      if (step.type !== 'stars-bars-solve') continue
      expect(step.items).toBeGreaterThan(0)
      expect(step.groups).toBeGreaterThanOrEqual(2)
      expect(step.itemNoun.length).toBeGreaterThan(0)
      expect(step.groupNoun.length).toBeGreaterThan(0)
      // The derived count must be a real positive combination C(n + k − 1, k − 1).
      const bars = step.groups - 1
      expect(choose(step.items + bars, bars)).toBeGreaterThan(0)
      if (step.scaffold !== undefined) {
        expect(typeof step.scaffold).toBe('boolean')
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

  it('has well-formed classify steps', () => {
    for (const step of lesson.steps) {
      if (step.type !== 'classify') continue
      expect(step.scenarios.length).toBeGreaterThanOrEqual(3)
      const answers = new Set<string>()
      for (const sc of step.scenarios) {
        expect(['permutation', 'combination']).toContain(sc.answer)
        expect(sc.text.length).toBeGreaterThan(0)
        expect(sc.hint.length).toBeGreaterThan(0)
        answers.add(sc.answer)
      }
      // Practice is only meaningful if both kinds show up.
      expect(answers.has('permutation')).toBe(true)
      expect(answers.has('combination')).toBe(true)
      const ids = step.scenarios.map((sc) => sc.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('has well-formed casework steps with consistent arithmetic', () => {
    for (const step of lesson.steps) {
      if (step.type !== 'casework') continue
      expect(step.cases.length).toBeGreaterThanOrEqual(2)
      const checkGate = (id: string, value: number, expr?: string) => {
        expect(Number.isInteger(value)).toBe(true)
        expect(value).toBeGreaterThan(0)
        if (expr) {
          const parsed = evalSimpleExpression(expr)
          if (parsed) {
            expect(parsed.value, `${id}: ${expr}`).toBe(parsed.target)
            expect(parsed.target).toBe(value)
          }
        }
      }
      let sum = 0
      for (const c of step.cases) {
        expect(c.factors.reduce((a, b) => a * b, 1)).toBe(c.correctValue)
        checkGate(c.id, c.correctValue, c.revealExpression)
        sum += c.correctValue
      }
      checkGate('total', step.total.correctValue, step.total.revealExpression)
      // The combined total must be the sum of the cases.
      expect(step.total.correctValue).toBe(sum)
    }
  })
})
