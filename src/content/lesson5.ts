import type { Lesson } from '../types/lesson'

export const lesson5: Lesson = {
  id: 'lesson-5',
  title: 'Complementary Counting',
  subject: 'AP Statistics · Combinatorics',
  order: 5,
  prerequisiteLessonId: 'lesson-4',
  tagline: 'Sometimes the fastest way to count what you want is to count what you don’t.',
  completionMessage:
    'You’ve got the “at least one” trick: count the total, subtract the cases you don’t want.',
  steps: [
    {
      id: 'step-2-at-least-one',
      step: 1,
      type: 'guided-solve',
      prompt: 'Now flip a coin 8 times. How many sequences have at least one heads?',
      intro: 'All 256 sequences split by their number of heads. Listing them is hopeless.',
      visual: {
        component: 'complement-tree',
        rootLabel: 'All sequences',
        branches: [
          { id: 'h0', label: '0 heads', count: 1, wanted: false },
          { id: 'h1', label: '1 head', count: 8, wanted: true },
          { id: 'h2', label: '2 heads', count: 28, wanted: true },
          { id: 'h3', label: '3 heads', count: 56, wanted: true },
          { id: 'h4', label: '4 heads', count: 70, wanted: true },
          { id: 'h5', label: '5 heads', count: 56, wanted: true },
          { id: 'h6', label: '6 heads', count: 28, wanted: true },
          { id: 'h7', label: '7 heads', count: 8, wanted: true },
          { id: 'h8', label: '8 heads', count: 1, wanted: true },
        ],
      },
      resultLabel: 'sequences',
      blanks: [
        {
          id: 'none',
          label: 'Sequences with NO heads',
          prompt: 'How many of the 256 sequences have zero heads (every flip is tails)?',
          correctValue: 1,
          revealExpression: 'just all-tails',
          hintText: 'Zero heads means every flip came up tails. How many sequences are completely tails?',
          feedbackWrong: {
            default: 'There’s exactly one all-tails sequence.',
            specificCases: [
              { answer: 8, message: 'Not 8. “No heads” means every flip is tails — only one sequence does that. So 1.' },
            ],
          },
        },
        {
          id: 'wanted',
          label: 'At least one heads',
          prompt: 'So how many sequences have at least one heads?',
          correctValue: 255,
          revealExpression: '256 − 1 = 255',
          hintText: 'Only the all-tails sequence has no heads. How do you count all 256 except that one?',
          feedbackWrong: {
            default: 'Subtract the one all-tails case from 256: 256 − 1 = 255.',
            specificCases: [
              { answer: 1, message: 'That’s the all-tails case you’re removing. You want all the rest: 256 − 1 = 255.' },
            ],
          },
        },
      ],
    },
    {
      id: 'step-3-dice',
      step: 2,
      type: 'guided-solve',
      prompt: 'Roll two dice. How many outcomes show at least one 6?',
      visual: {
        component: 'complement-tree',
        rootLabel: 'All outcomes',
        branches: [
          { id: 's0', label: 'no 6', count: 25, wanted: false },
          { id: 's1', label: 'one 6', count: 10, wanted: true },
          { id: 's2', label: 'two 6s', count: 1, wanted: true },
        ],
      },
      resultLabel: 'outcomes',
      blanks: [
        {
          id: 'total',
          label: 'Total outcomes',
          prompt: 'Each die shows 1–6. How many outcomes for two dice?',
          correctValue: 36,
          revealExpression: '6 × 6 = 36',
          hintText: 'Each die lands on one of 6 faces, and the dice are independent. How do independent choices combine?',
          feedbackWrong: {
            default: 'Two dice, 6 faces each: 6 × 6 = 36.',
            specificCases: [
              { answer: 12, message: 'That’s 6 + 6. The dice are independent choices, so multiply: 6 × 6 = 36.' },
            ],
          },
        },
        {
          id: 'none',
          label: 'Outcomes with NO 6',
          prompt: 'How many outcomes have no 6 at all?',
          correctValue: 25,
          revealExpression: '5 × 5 = 25',
          hintText: 'If neither die may show a 6, how many faces stay safe on each die, and how do the two combine?',
          feedbackWrong: {
            default: 'Ban the 6: each die has 5 options, so 5 × 5 = 25.',
            specificCases: [
              { answer: 10, message: 'That’s 5 + 5. Each die independently has 5 safe faces: 5 × 5 = 25.' },
            ],
          },
        },
        {
          id: 'wanted',
          label: 'At least one 6',
          prompt: 'So how many outcomes show at least one 6?',
          correctValue: 11,
          revealExpression: '36 − 25 = 11',
          hintText: 'You have the total and the number with no 6 at all. How do you get the ones with at least one 6?',
          feedbackWrong: {
            default: 'Subtract the complement: 36 − 25 = 11.',
            specificCases: [
              { answer: 25, message: 'That’s the no-6 count. Subtract it from the total: 36 − 25 = 11.' },
            ],
          },
        },
      ],
    },
    {
      id: 'step-4-rule',
      step: 3,
      type: 'rule-statement',
      explanation:
        'Complementary counting: when the thing you want is messy to count, especially “at least one” problems, count the total and subtract the cases you do not want. Wanted = Total − Unwanted.',
      overlayExpression: 'Wanted = Total − Unwanted',
    },
    {
      id: 'step-teach-back',
      step: 4,
      type: 'teach-back',
      concept: 'complementary counting',
      prompt:
        "You're the teacher now. Explain complementary counting in your own words — I'll point out anything to fix before your final check.",
      keyPoints: [
        'It’s easiest when counting what you want directly is messy, like “at least one”',
        'Count the total number of outcomes',
        'Count the unwanted outcomes (the complement)',
        'Subtract to get the answer: wanted = total − unwanted',
      ],
    },
    {
      id: 'step-5-cold',
      step: 5,
      type: 'cold-problem',
      problems: [
        {
          id: 'problem-a',
          prompt:
            'You flip a coin 4 times. How many of the possible sequences contain at least one heads?',
          correctValue: 15,
          feedbackWrong: {
            default:
              'Total sequences = 2 × 2 × 2 × 2 = 16. Exactly one (all tails) has no heads, so 16 − 1 = 15.',
            specificCases: [
              {
                answer: 1,
                message:
                  'That’s the single all-tails sequence, the one you subtract. The answer is 16 − 1 = 15.',
              },
              { answer: 16, message: 'That’s every sequence, including all-tails. Remove that one: 16 − 1 = 15.' },
            ],
          },
        },
        {
          id: 'problem-b',
          prompt:
            'You roll two dice. How many outcomes have at least one die showing an even number?',
          correctValue: 27,
          feedbackWrong: {
            default:
              'Total = 36. Outcomes with no evens (both dice odd) = 3 × 3 = 9. So 36 − 9 = 27.',
            specificCases: [
              {
                answer: 9,
                message: 'That’s the all-odd complement. Subtract it from the total: 36 − 9 = 27.',
              },
            ],
          },
        },
      ],
    },
  ],
}
