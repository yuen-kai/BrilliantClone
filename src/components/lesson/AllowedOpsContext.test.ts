import { describe, expect, it } from 'vitest'
import { allowedOpsForLevel, newlyUnlockedAfterLevel } from './AllowedOpsContext'

describe('allowedOpsForLevel', () => {
  it('level 1 (Multiplication) allows only basic arithmetic', () => {
    expect([...allowedOpsForLevel(1)].sort()).toEqual(['*', '+', '-', '/'])
  })

  it('level 2 (Permutations & Combinations) adds ! but keeps P and C locked', () => {
    const ops = allowedOpsForLevel(2)
    expect(ops.has('!')).toBe(true)
    expect(ops.has('P')).toBe(false)
    expect(ops.has('C')).toBe(false)
  })

  it('level 3+ unlocks every operator (even when a learner skips straight to it)', () => {
    for (const level of [3, 4, 5, 6]) {
      const ops = allowedOpsForLevel(level)
      expect(ops.has('!'), `level ${level}`).toBe(true)
      expect(ops.has('P'), `level ${level}`).toBe(true)
      expect(ops.has('C'), `level ${level}`).toBe(true)
    }
  })
})

describe('newlyUnlockedAfterLevel', () => {
  it('announces factorials after level 1 and P/C after level 2', () => {
    expect(newlyUnlockedAfterLevel(1)).toEqual(['!'])
    expect(newlyUnlockedAfterLevel(2)).toEqual(['P', 'C'])
  })

  it('announces nothing once every operator is already available', () => {
    expect(newlyUnlockedAfterLevel(3)).toEqual([])
    expect(newlyUnlockedAfterLevel(6)).toEqual([])
  })
})
