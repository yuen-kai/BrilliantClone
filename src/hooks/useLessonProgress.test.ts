import { describe, expect, it } from 'vitest'
import { recordLocalStreakUpdate, loadLocalStreak } from '../hooks/useLessonProgress'

describe('local streak persistence', () => {
  it('starts streak on first activity', () => {
    localStorage.clear()
    const streak = recordLocalStreakUpdate()
    expect(streak.count).toBe(1)
    expect(loadLocalStreak().count).toBe(1)
  })
})
