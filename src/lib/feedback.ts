import type { FeedbackWrong } from '../types/lesson'

export function resolveFeedback(answer: number, feedbackWrong: FeedbackWrong): string {
  const match = feedbackWrong.specificCases.find((c) => c.answer === answer)
  return match?.message ?? feedbackWrong.default
}

export function isCorrectAnswer(answer: number, expected: number): boolean {
  return answer === expected
}
