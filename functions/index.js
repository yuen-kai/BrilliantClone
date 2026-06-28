/**
 * Server-side proxy for the "teach it back" tutor. The OpenAI key lives only
 * here (a Firebase secret), never in the client bundle. The callable receives
 * { topic, transcript }, runs the structured assessment, and returns the raw
 * JSON for the client to normalize. The prompt lives server-side so the key
 * can't be used for arbitrary completions.
 */
// Callable proxy for the teach-back tutor; deployed via Firebase.
const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { defineSecret } = require('firebase-functions/params')
const OpenAI = require('openai')

const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY')
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o'

const SYSTEM = [
  'You are a kind, Socratic tutor for a "teach it back" exercise: the learner is shown a specific problem and explains how they would SOLVE it (demonstrating the concept), just before their final check. Help them arrive at the right approach themselves — don’t hand it to them.',
  'Default response to a genuine attempt:',
  '- Warmly name what they got right.',
  '- Then ask ONE short, focused question that leads them toward the single most important missing idea. Ask a question — do NOT state the idea, define it, give the answer, or list the remaining steps.',
  '- One nudge at a time. Never enumerate what is missing.',
  'Only explain an idea outright (state it in plain words) when EITHER the learner explicitly asks for help / says they are stuck / says they don’t know, OR they have already tried that same idea about twice without getting it. Even then, explain just ONE idea with a quick example, then ask them to say it back.',
  'Keep replies short (1–3 sentences), warm, and never repeat a previous nudge or make them feel bad for not knowing.',
  'Be generous: the bar is a plain, rule-level explanation of the approach in their own words — count an idea as demonstrated once they express the gist, even loosely. They are teaching the method, so don’t require the final number, exact wording, or formulas.',
  'Fields: "correct" lists verbatim the key ideas they have demonstrated (judged generously). "corrections" should be empty during normal attempts — use it only to restate an idea you just explained after they were stuck. "solid" is true once every key idea has been demonstrated.',
].join('\n')

const RESPONSE_FORMAT = {
  type: 'json_schema',
  json_schema: {
    name: 'teach_assessment',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        correct: { type: 'array', items: { type: 'string' } },
        corrections: { type: 'array', items: { type: 'string' } },
        message: { type: 'string' },
        solid: { type: 'boolean' },
      },
      required: ['correct', 'corrections', 'message', 'solid'],
    },
  },
}

function buildUserMessage(topic, transcript) {
  const ideas = topic.keyPoints.map((kp, i) => `${i + 1}. ${kp}`).join('\n')
  const convo = transcript
    .map((t) => `${t.role === 'ai' ? 'Tutor' : 'Learner'}: ${t.text}`)
    .join('\n')
  return [
    `Concept: ${topic.concept}`,
    `The learner is teaching how to solve this problem: ${topic.problem}`,
    ``,
    `KEY IDEAS their approach should show (copy any matches verbatim into "correct"):`,
    ideas,
    ``,
    `Conversation so far:`,
    convo,
    ``,
    `Assess the learner's most recent message.`,
  ].join('\n')
}

exports.teachAssess = onCall({ secrets: [OPENAI_API_KEY] }, async (request) => {
  const { topic, transcript } = request.data || {}
  if (
    !topic ||
    typeof topic.concept !== 'string' ||
    typeof topic.problem !== 'string' ||
    !Array.isArray(topic.keyPoints) ||
    !Array.isArray(transcript)
  ) {
    throw new HttpsError('invalid-argument', 'Expected { topic, transcript }.')
  }

  const client = new OpenAI({ apiKey: OPENAI_API_KEY.value() })
  try {
    const res = await client.chat.completions.create({
      model: MODEL,
      max_completion_tokens: 700,
      response_format: RESPONSE_FORMAT,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: buildUserMessage(topic, transcript) },
      ],
    })
    const content = res.choices?.[0]?.message?.content
    return { raw: content ? JSON.parse(content) : null }
  } catch {
    throw new HttpsError('internal', 'Assessment failed.')
  }
})
