import { describe, expect, it } from 'vitest'
import { computeStreakUpdate, todayDateString, yesterdayDateString } from './streak'
import type { Streak } from '../types/lesson'

describe('computeStreakUpdate', () => {
  it('starts streak at 1 when no prior streak', () => {
    const result = computeStreakUpdate(null)
    expect(result.count).toBe(1)
    expect(result.lastActiveDate).toBe(todayDateString())
  })

  it('does not change streak on same day', () => {
    const today = todayDateString()
    const current: Streak = { count: 5, lastActiveDate: today }
    const result = computeStreakUpdate(current)
    expect(result).toEqual(current)
  })

  it('increments streak on consecutive day', () => {
    const current: Streak = { count: 3, lastActiveDate: yesterdayDateString() }
    const result = computeStreakUpdate(current)
    expect(result.count).toBe(4)
    expect(result.lastActiveDate).toBe(todayDateString())
  })

  it('resets streak after gap', () => {
    const current: Streak = { count: 10, lastActiveDate: '2020-01-01' }
    const result = computeStreakUpdate(current)
    expect(result.count).toBe(1)
    expect(result.lastActiveDate).toBe(todayDateString())
  })
})
