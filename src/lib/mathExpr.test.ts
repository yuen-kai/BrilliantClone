import { describe, expect, it } from 'vitest'
import { evaluateExpression, exprToLatex, type Op } from './mathExpr'

function value(input: string, allowedOps?: Set<Op>): number {
  const result = evaluateExpression(input, allowedOps)
  if (!result.ok) throw new Error(`expected ok for "${input}", got ${result.error}`)
  return result.value
}

describe('evaluateExpression — arithmetic', () => {
  it('evaluates a bare integer', () => {
    expect(value('15')).toBe(15)
  })

  it('respects multiplication/division precedence and order', () => {
    expect(value('6*5/2')).toBe(15)
  })

  it('multiplies before adding', () => {
    expect(value('2+3*4')).toBe(14)
  })

  it('honors parentheses', () => {
    expect(value('(2+3)*4')).toBe(20)
  })

  it('handles unary minus', () => {
    expect(value('-3+10')).toBe(7)
    expect(value('10*-2')).toBe(-20)
  })
})

describe('evaluateExpression — factorial, C, P', () => {
  it('computes factorial', () => {
    expect(value('5!')).toBe(120)
  })

  it('computes combinations', () => {
    expect(value('C(6,2)')).toBe(15)
    expect(value('c(6, 2)')).toBe(15)
  })

  it('computes permutations', () => {
    expect(value('P(5,3)')).toBe(60)
    expect(value('p(5, 3)')).toBe(60)
  })
})

describe('evaluateExpression — typographic aliases', () => {
  it('accepts ×, ÷ and the unicode minus', () => {
    expect(value('6 × 5 ÷ 2')).toBe(15)
    expect(value('10 − 3')).toBe(7)
  })
})

describe('evaluateExpression — opsUsed', () => {
  it('tracks every operator actually used', () => {
    const result = evaluateExpression('2+3*4')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect([...result.opsUsed].sort()).toEqual(['*', '+'])
  })

  it('tracks factorial, C and P', () => {
    const result = evaluateExpression('C(6,2) + 5! + P(5,3)')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.opsUsed.has('C')).toBe(true)
    expect(result.opsUsed.has('P')).toBe(true)
    expect(result.opsUsed.has('!')).toBe(true)
    expect(result.opsUsed.has('+')).toBe(true)
  })

  it('a bare integer uses no ops', () => {
    const result = evaluateExpression('15')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.opsUsed.size).toBe(0)
  })
})

describe('evaluateExpression — allowedOps gating', () => {
  it('locks an op that is not unlocked yet', () => {
    const result = evaluateExpression('5!', new Set<Op>(['+', '-', '*', '/']))
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toBe('locked')
    expect(result.lockedOp).toBe('!')
  })

  it('allows a bare integer even with an empty allowed set', () => {
    expect(value('15', new Set<Op>())).toBe(15)
  })

  it('allows expressions whose ops are all unlocked', () => {
    expect(value('2+3*4', new Set<Op>(['+', '*']))).toBe(14)
  })
})

describe('evaluateExpression — errors (never throws)', () => {
  it('flags empty / whitespace input', () => {
    expect(evaluateExpression('')).toMatchObject({ ok: false, error: 'empty' })
    expect(evaluateExpression('   ')).toMatchObject({ ok: false, error: 'empty' })
  })

  it('flags malformed input as syntax errors', () => {
    for (const bad of ['2+', 'C(6)', ')(', '2**3', '*5', 'foo', '()']) {
      const result = evaluateExpression(bad)
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error).toBe('syntax')
    }
  })

  it('flags factorial of a non-whole / negative number as domain', () => {
    expect(evaluateExpression('(-3)!')).toMatchObject({ ok: false, error: 'domain' })
    expect(evaluateExpression('2.5!')).toMatchObject({ ok: false, error: 'domain' })
  })

  it('flags division by zero as domain', () => {
    expect(evaluateExpression('1/0')).toMatchObject({ ok: false, error: 'domain' })
  })
})

describe('exprToLatex — best-effort, never throws', () => {
  it('swaps binary operators', () => {
    expect(exprToLatex('6*5')).toContain('\\times')
    expect(exprToLatex('6/2')).toContain('\\dfrac{6}{2}')
  })

  it('renders combinations and permutations', () => {
    expect(exprToLatex('C(6,2)')).toContain('\\binom{6}{2}')
    expect(exprToLatex('P(5,3)')).toContain('P_{3}')
  })

  it('renders factorial', () => {
    expect(exprToLatex('5!')).toBe('5!')
  })

  it('does not throw on malformed input', () => {
    expect(() => exprToLatex('2+')).not.toThrow()
    expect(() => exprToLatex(')(')).not.toThrow()
    expect(() => exprToLatex('')).not.toThrow()
  })
})
