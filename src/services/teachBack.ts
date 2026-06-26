/**
 * The AI side of the "teach it back" step, backed by Claude (Anthropic). The
 * learner explains the concept; Claude checks that explanation against the step's
 * structured key points and corrects mistakes. Claude only maps the explanation
 * to which key ideas were demonstrated and lists fixes — it never invents the
 * concept, so it stays grounded in the lesson's own checklist.
 *
 * If no API key is configured the call returns null and the UI shows the step as
 * unavailable — there are no canned/fallback responses.
 */
import type Anthropic from '@anthropic-ai/sdk'
import { ANTHROPIC_MODEL, getAnthropic, isAiConfigured } from './anthropic'

export { isAiConfigured }

export type TeachTurn = { role: 'learner' | 'ai'; text: string }

/** What the lesson hands the assessor: the concept name and its key ideas. */
export type TeachTopic = { concept: string; keyPoints: string[] }

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

const SYSTEM = [
  'You are a warm, encouraging tutor running a "teach it back" exercise: the learner is the teacher and explains a concept to you, right before their final check. Your job is to check their explanation against a list of KEY IDEAS and gently correct mistakes.',
  'Always:',
  '- React directly to what the learner JUST said. Name what they got right before nudging, and vary your wording — never repeat a canned line.',
  '- If they seem unsure, confused, or give a thin answer, reassure them warmly and offer ONE concrete leading hint to get unstuck.',
  '- Never quote the key ideas verbatim or hand over the full answer; guide with short hints and questions.',
  '- Report your assessment ONLY by calling the submit_assessment tool.',
].join('\n')

const ASSESS_TOOL: Anthropic.Tool = {
  name: 'submit_assessment',
  description: 'Report which key ideas the learner has demonstrated and how to coach them next.',
  input_schema: {
    type: 'object',
    properties: {
      correct: {
        type: 'array',
        items: { type: 'string' },
        description: 'Key ideas the learner CLEARLY demonstrated, copied verbatim from the KEY IDEAS list.',
      },
      corrections: {
        type: 'array',
        items: { type: 'string' },
        description: 'At most two short Socratic nudges toward what is still missing. Never the answer itself.',
      },
      message: {
        type: 'string',
        description: '1-3 supportive, specific sentences reacting to the learner.',
      },
      solid: {
        type: 'boolean',
        description: 'True only when every key idea has been demonstrated correctly.',
      },
    },
    required: ['correct', 'corrections', 'message', 'solid'],
  },
}

export function buildUserMessage(topic: TeachTopic, transcript: TeachTurn[]): string {
  const ideas = topic.keyPoints.map((kp, i) => `${i + 1}. ${kp}`).join('\n')
  const convo = transcript
    .map((t) => `${t.role === 'ai' ? 'Tutor' : 'Learner'}: ${t.text}`)
    .join('\n')
  return [
    `Concept the learner is teaching: ${topic.concept}`,
    ``,
    `KEY IDEAS to check against (copy any matches verbatim into "correct"):`,
    ideas,
    ``,
    `Conversation so far:`,
    convo,
    ``,
    `Assess the learner's most recent message by calling submit_assessment.`,
  ].join('\n')
}

/** Ask Claude to assess one teaching turn. Returns null on any failure (no key,
 * network/API error, or no tool output) so the UI degrades honestly. */
export async function assessTeaching(
  topic: TeachTopic,
  transcript: TeachTurn[],
): Promise<TeachAssessment | null> {
  const client = getAnthropic()
  if (!client) return null
  try {
    const res = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 700,
      system: SYSTEM,
      tools: [ASSESS_TOOL],
      tool_choice: { type: 'tool', name: 'submit_assessment' },
      messages: [{ role: 'user', content: buildUserMessage(topic, transcript) }],
    })
    const block = res.content.find((b) => b.type === 'tool_use')
    if (!block || block.type !== 'tool_use') return null
    return normalizeAssessment(block.input, topic.keyPoints)
  } catch {
    return null
  }
}
