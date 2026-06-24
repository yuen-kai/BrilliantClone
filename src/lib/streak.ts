import type { Streak } from '../types/lesson'

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

export function yesterdayDateString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export function computeStreakUpdate(current: Streak | null): Streak {
  const today = todayDateString()

  if (!current || !current.lastActiveDate) {
    return { count: 1, lastActiveDate: today }
  }

  if (current.lastActiveDate === today) {
    return current
  }

  if (current.lastActiveDate === yesterdayDateString()) {
    return { count: current.count + 1, lastActiveDate: today }
  }

  return { count: 1, lastActiveDate: today }
}
