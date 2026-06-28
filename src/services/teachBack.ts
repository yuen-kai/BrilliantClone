/**
 * Client side of the "teach it back" tutor. The actual ChatGPT call runs in a
 * Cloud Function (`teachAssess`) so the OpenAI key stays server-side and never
 * ships in the browser bundle. Here we just call that function and shape the
 * result; if Firebase isn't configured (or the call fails) we return null. We
 * never fabricate AI replies. When the live tutor can't run, the UI swaps in an
 * authored self-check instead (see TeachBackStep), so the step still happens.
 */
import { getFunctions, httpsCallable } from 'firebase/functions'
import { firebaseApp, isFirebaseConfigured } from '../firebase/config'

/** The live tutor runs whenever the app is connected to Firebase (the proxy
 * lives there). With Firebase off (offline/e2e) the step becomes an authored
 * self-check against the rubric instead. */
export const isAiConfigured = isFirebaseConfigured

export type TeachTurn = { role: 'learner' | 'ai'; text: string }

/** What the lesson hands the assessor: the concept, the concrete problem the
 * learner is teaching how to solve, and the key ideas a good approach shows. */
export type TeachTopic = { concept: string; problem: string; keyPoints: string[] }

export type TeachAssessment = {
  /** Key ideas the learner clearly demonstrated. */
  correct: string[]
  /** Specific mistakes or gaps to fix (short, no answer dumps). */
  corrections: string[]
  /** Conversational, supportive correction. */
  message: string
  /** Whether the explanation is now correct and complete. */
  solid: boolean
}

/** Fraction of key ideas demonstrated — counted by us against the rubric, so the
 * model can't credit ideas that aren't in the checklist. */
export function scoreCoverage(keyPoints: string[], correct: string[]): number {
  if (keyPoints.length === 0) return 0
  const valid = new Set(keyPoints)
  const hits = new Set(correct.filter((c) => valid.has(c)))
  return hits.size / keyPoints.length
}

export function normalizeAssessment(raw: unknown, keyPoints: string[]): TeachAssessment {
  const obj = (raw ?? {}) as Record<string, unknown>
  const correct = Array.isArray(obj.correct)
    ? keyPoints.filter((kp) => (obj.correct as unknown[]).includes(kp))
    : []
  const corrections = Array.isArray(obj.corrections)
    ? (obj.corrections as unknown[]).filter((c): c is string => typeof c === 'string')
    : []
  return {
    correct,
    corrections,
    message: typeof obj.message === 'string' ? obj.message : '',
    solid: obj.solid === true && correct.length === keyPoints.length,
  }
}

/** Assess one teaching turn via the Cloud Function proxy. Returns null on any
 * failure (Firebase off, function missing, network/API error) so the UI
 * degrades honestly. */
export async function assessTeaching(
  topic: TeachTopic,
  transcript: TeachTurn[],
): Promise<TeachAssessment | null> {
  if (!isFirebaseConfigured || !firebaseApp) return null
  try {
    const assess = httpsCallable(getFunctions(firebaseApp), 'teachAssess')
    const res = await assess({ topic, transcript })
    const raw = (res.data as { raw?: unknown } | null)?.raw
    return raw == null ? null : normalizeAssessment(raw, topic.keyPoints)
  } catch {
    return null
  }
}
