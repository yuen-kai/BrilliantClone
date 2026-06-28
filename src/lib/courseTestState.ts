/**
 * Spaced-repetition state for a course's mixed test.
 *
 * Flow: finish the lessons → the test is `available`. Pass it once and the
 * course is `primed` (timestamped). The same test is then withheld as a
 * `retest` until RETEST_DELAY_MS later, when it becomes available again; passing
 * the retest marks the course `reinforced`.
 *
 * The timestamps live in the test's progress `stepAnswers` bag so we don't have
 * to widen the shared LessonProgress type.
 */

export const RETEST_DELAY_MS = 2 * 24 * 60 * 60 * 1000 // 2 days

export type TestPhase = 'locked' | 'available' | 'primed' | 'retest' | 'reinforced'

export type TestMeta = {
  /** When the course test was first passed (course became primed). */
  primedAt?: string
  /** When the retest was passed (course became reinforced). */
  retestedAt?: string
}

export function readTestMeta(stepAnswers: Record<string, unknown> | undefined): TestMeta {
  const a = stepAnswers ?? {}
  const primedAt = typeof a.primedAt === 'string' ? a.primedAt : undefined
  const retestedAt = typeof a.retestedAt === 'string' ? a.retestedAt : undefined
  return { primedAt, retestedAt }
}

export type TestStatus = {
  phase: TestPhase
  /** Epoch ms the retest unlocks (only when phase is `primed`). */
  retestAt: number | null
}

export function getTestStatus(allMastered: boolean, meta: TestMeta, now = Date.now()): TestStatus {
  if (meta.retestedAt) return { phase: 'reinforced', retestAt: null }
  if (meta.primedAt) {
    const retestAt = new Date(meta.primedAt).getTime() + RETEST_DELAY_MS
    return now >= retestAt ? { phase: 'retest', retestAt: null } : { phase: 'primed', retestAt }
  }
  return { phase: allMastered ? 'available' : 'locked', retestAt: null }
}

/** Compact "1d 5h" / "5h 12m" / "8m" remaining string. */
export function formatRemaining(ms: number): string {
  const totalMin = Math.max(0, Math.ceil(ms / 60000))
  const d = Math.floor(totalMin / 1440)
  const h = Math.floor((totalMin % 1440) / 60)
  const m = totalMin % 60
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}
