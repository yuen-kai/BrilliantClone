import type { Lesson } from '../types/lesson'

export const lesson4: Lesson = {
  id: 'lesson-4',
  title: 'Complementary Counting',
  subject: 'AP Statistics · Combinatorics',
  order: 4,
  prerequisiteLessonId: 'lesson-3',
  tagline: 'Sometimes the fastest way to count what you want is to count what you don’t.',
  completionMessage:
    'You’ve got the “at least one” trick: count the total, subtract the cases you don’t want.',
  steps: [
    {
      id: 'step-1-flips',
      step: 1,
      type: 'visual-interactive',
      prompt:
        'You flip a coin 3 times and write down the sequence (like H-T-H). Build the tree of every possible sequence.',
      visual: {
        component: 'tree-build',
        treeConfig: {
          levels: [
            { label: 'Flip 1', branchCount: 2 },
            { label: 'Flip 2', branchCount: 2 },
            { label: 'Flip 3', branchCount: 2 },
          ],
        },
      },
      gated: true,
      stages: [
        { kind: 'node-count', branchCount: 2, expectedNodeCount: 2, multiplierLabel: '×2' },
        { kind: 'node-count', branchCount: 2, expectedNodeCount: 4, multiplierLabel: '×2' },
        { kind: 'node-count', branchCount: 2, expectedNodeCount: 8, multiplierLabel: '×2' },
      ],
      finalGate: {
        correctValue: 8,
        prompt: 'How many different 3-flip sequences are there in total?',
        hintText: 'Two outcomes per flip, three flips: 2 × 2 × 2.',
        feedbackWrong: {
          default: 'Multiply the outcomes per flip: 2 × 2 × 2 = 8.',
          specificCases: [
            { answer: 6, message: 'That’s 2 + 2 + 2. Each flip multiplies the choices: 2 × 2 × 2 = 8.' },
          ],
        },
      },
      hintText: 'Count the nodes at this level after the split.',
      feedbackWrong: {
        default: 'Count the nodes at this level.',
        specificCases: [],
      },
    },
    {
      id: 'step-2-at-least-one',
      step: 2,
      type: 'guided-solve',
      prompt:
        'Of those 8 sequences, how many have AT LEAST ONE heads? Listing them is fiddly, so count the opposite instead.',
      intro: 'The opposite of “at least one heads” is “no heads at all.” That’s much easier to count.',
      visual: {
        component: 'complement-dots',
        total: 8,
        unwanted: 1,
        wantedLabel: 'have a head',
        unwantedLabel: 'all-tails',
      },
      resultLabel: 'sequences',
      blanks: [
        {
          id: 'none',
          label: 'Sequences with NO heads',
          prompt: 'How many of the 8 sequences have zero heads (every flip is tails)?',
          correctValue: 1,
          revealExpression: 'just T-T-T',
          hintText: 'Only one sequence is all tails: T-T-T.',
          feedbackWrong: {
            default: 'There’s exactly one all-tails sequence: T-T-T.',
            specificCases: [
              { answer: 3, message: 'Not 3. “No heads” means every flip is tails, and only T-T-T does that. So 1.' },
            ],
          },
        },
        {
          id: 'wanted',
          label: 'At least one heads',
          prompt: 'So how many sequences have at least one heads? (total 8 − the all-tails one)',
          correctValue: 7,
          revealExpression: '8 − 1 = 7',
          hintText: 'Subtract the unwanted case from the total: 8 − 1.',
          feedbackWrong: {
            default: 'Subtract the one all-tails case from the 8 total: 8 − 1 = 7.',
            specificCases: [
              { answer: 1, message: 'That’s the all-tails case you’re removing. You want the rest: 8 − 1 = 7.' },
            ],
          },
        },
      ],
    },
    {
      id: 'step-3-dice',
      step: 3,
      type: 'guided-solve',
      prompt:
        'You roll two dice. How many of the outcomes show at least one 6? Again, the complement is friendlier.',
      intro: 'Count the total, then subtract the outcomes with NO 6 at all.',
      visual: {
        component: 'complement-dots',
        total: 36,
        unwanted: 25,
        wantedLabel: 'show a 6',
        unwantedLabel: 'with no 6',
      },
      resultLabel: 'outcomes',
      blanks: [
        {
          id: 'total',
          label: 'Total outcomes',
          prompt: 'Each die shows 1–6. How many outcomes for two dice? (6 × 6)',
          correctValue: 36,
          revealExpression: '6 × 6 = 36',
          hintText: 'Multiply the faces: 6 × 6.',
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
          prompt: 'How many outcomes have no 6 at all? (each die shows one of 1–5: 5 × 5)',
          correctValue: 25,
          revealExpression: '5 × 5 = 25',
          hintText: 'With 6 banned, each die has 5 options: 5 × 5.',
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
          prompt: 'So how many outcomes show at least one 6? (36 − 25)',
          correctValue: 11,
          revealExpression: '36 − 25 = 11',
          hintText: 'Total minus the no-6 outcomes: 36 − 25.',
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
      step: 4,
      type: 'rule-statement',
      explanation:
        'Complementary counting: when the thing you want is messy to count, especially “at least one” problems, count the total and subtract the cases you do not want. Wanted = Total − Unwanted.',
      referenceStepId: 'step-1-flips',
      overlayExpression: 'Total 2 × 2 × 2 = 8, then 8 − (none) = wanted',
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
