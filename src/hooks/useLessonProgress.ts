import { useCallback, useEffect, useRef, useState } from 'react'
import { collection, doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase/config'
import { computeStreakUpdate } from '../lib/streak'
import { lessons } from '../content/lessons'
import type { LessonProgress, Streak } from '../types/lesson'
import { useAuth } from '../context/AuthContext'

const LOCAL_KEY = 'brilliantclone-progress'
const LOCAL_STREAK_KEY = 'brilliantclone-streak'

function defaultProgress(): LessonProgress {
  return {
    currentStepIndex: 0,
    stepAnswers: {},
    mastered: null,
    completedAt: null,
    furthestStepIndex: 0,
  }
}

function loadLocalProgress(lessonId: string): LessonProgress {
  try {
    const raw = localStorage.getItem(`${LOCAL_KEY}-${lessonId}`)
    if (raw) return JSON.parse(raw) as LessonProgress
  } catch {
    /* ignore */
  }
  return defaultProgress()
}

function saveLocalProgress(lessonId: string, progress: LessonProgress) {
  localStorage.setItem(`${LOCAL_KEY}-${lessonId}`, JSON.stringify(progress))
}

export function loadLocalStreak(): Streak {
  try {
    const raw = localStorage.getItem(LOCAL_STREAK_KEY)
    if (raw) return JSON.parse(raw) as Streak
  } catch {
    /* ignore */
  }
  return { count: 0, lastActiveDate: '' }
}

function saveLocalStreak(streak: Streak) {
  localStorage.setItem(LOCAL_STREAK_KEY, JSON.stringify(streak))
}

export function recordLocalStreakUpdate(): Streak {
  const updated = computeStreakUpdate(loadLocalStreak())
  saveLocalStreak(updated)
  return updated
}

/** Seed every lesson as complete in local storage, so the "demo" account opens a
 * fully finished course. Each lesson lands on step 1 with all steps unlocked. */
export function seedDemoProgress() {
  const now = new Date().toISOString()
  for (const [id, lesson] of Object.entries(lessons)) {
    saveLocalProgress(id, {
      currentStepIndex: 0,
      stepAnswers: {},
      mastered: true,
      completedAt: now,
      furthestStepIndex: Math.max(0, lesson.steps.length - 1),
    })
  }
}

/** Wipe the seeded demo progress (used when leaving the demo). */
export function clearDemoProgress() {
  for (const id of Object.keys(lessons)) {
    try {
      localStorage.removeItem(`${LOCAL_KEY}-${id}`)
    } catch {
      /* ignore */
    }
  }
}

export type CourseDemoState = 'uncompleted' | 'primed' | 'completion'

/**
 * Demo-only: force one course into a milestone state so the priming / reward
 * flow can be inspected without playing through.
 *   - uncompleted: clears the course's lessons + course-test progress
 *   - primed:      all lessons mastered + course test just passed (cooldown)
 *   - completion:  all lessons mastered + course test reinforced (retest passed)
 */
export function applyCourseDemoState(
  courseId: string,
  lessonIds: string[],
  state: CourseDemoState,
) {
  const now = new Date().toISOString()
  const testId = `${courseId}-test`

  if (state === 'uncompleted') {
    for (const id of [...lessonIds, testId]) {
      try {
        localStorage.removeItem(`${LOCAL_KEY}-${id}`)
      } catch {
        /* ignore */
      }
    }
    return
  }

  for (const id of lessonIds) {
    saveLocalProgress(id, {
      currentStepIndex: 0,
      stepAnswers: {},
      mastered: true,
      completedAt: now,
      furthestStepIndex: 0,
    })
  }

  const stepAnswers =
    state === 'primed'
      ? { primedAt: now }
      : { primedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), retestedAt: now }
  saveLocalProgress(testId, {
    currentStepIndex: 0,
    stepAnswers,
    mastered: true,
    completedAt: now,
    furthestStepIndex: 0,
  })
}

export function useLessonProgress(lessonId: string) {
  const { user } = useAuth()
  const [progress, setProgress] = useState<LessonProgress>(() =>
    isFirebaseConfigured && user ? defaultProgress() : loadLocalProgress(lessonId),
  )
  const [loading, setLoading] = useState(isFirebaseConfigured && !!user)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured || !user || !db) {
      setProgress(loadLocalProgress(lessonId))
      setLoading(false)
      return
    }

    const ref = doc(db, 'users', user.uid, 'progress', lessonId)
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as LessonProgress
        setProgress({
          currentStepIndex: data.currentStepIndex ?? 0,
          stepAnswers: data.stepAnswers ?? {},
          mastered: data.mastered ?? null,
          completedAt: data.completedAt ?? null,
          furthestStepIndex: data.furthestStepIndex ?? 0,
        })
      } else {
        setProgress(defaultProgress())
      }
      setLoading(false)
    })
  }, [user, lessonId])

  const persistProgress = useCallback(
    (next: LessonProgress) => {
      setProgress(next)

      if (!isFirebaseConfigured || !user || !db) {
        saveLocalProgress(lessonId, next)
        return
      }

      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        if (!db) return
        const ref = doc(db, 'users', user.uid, 'progress', lessonId)
        await setDoc(ref, next, { merge: true })
      }, 300)
    },
    [user, lessonId],
  )

  const recordLessonStart = useCallback(async () => {
    if (!isFirebaseConfigured || !user || !db) {
      recordLocalStreakUpdate()
      return
    }

    const userRef = doc(db, 'users', user.uid)
    const userSnap = await getDoc(userRef)
    const currentStreak = userSnap.exists()
      ? ((userSnap.data().streak as Streak | undefined) ?? null)
      : null
    const updated = computeStreakUpdate(currentStreak)

    if (!currentStreak || updated.lastActiveDate !== currentStreak.lastActiveDate) {
      await setDoc(userRef, { streak: updated }, { merge: true })
    }
  }, [user])

  return {
    progress,
    loading,
    persistProgress,
    recordLessonStart,
  }
}

export function useAllLessonProgress() {
  const { user } = useAuth()
  const [progressMap, setProgressMap] = useState<Record<string, LessonProgress>>({})
  const [streak, setStreak] = useState<Streak>({ count: 0, lastActiveDate: '' })
  const [loading, setLoading] = useState(isFirebaseConfigured && !!user)

  useEffect(() => {
    if (!isFirebaseConfigured || !user || !db) {
      const map: Record<string, LessonProgress> = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(`${LOCAL_KEY}-`)) {
          const lessonId = key.slice(`${LOCAL_KEY}-`.length)
          map[lessonId] = loadLocalProgress(lessonId)
        }
      }
      setProgressMap(map)
      setStreak(loadLocalStreak())
      setLoading(false)
      return
    }

    const userRef = doc(db, 'users', user.uid)
    const unsubUser = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        setStreak((data.streak as Streak) ?? { count: 0, lastActiveDate: '' })
      }
    })

    const colRef = collection(db, 'users', user.uid, 'progress')
    const unsubProgress = onSnapshot(colRef, (snapshot) => {
      const map: Record<string, LessonProgress> = {}
      snapshot.forEach((d) => {
        map[d.id] = d.data() as LessonProgress
      })
      setProgressMap(map)
      setLoading(false)
    })

    return () => {
      unsubUser()
      unsubProgress()
    }
  }, [user])

  return { progressMap, streak, loading }
}
