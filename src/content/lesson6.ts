import type { Lesson } from '../types/lesson'

export const lesson6: Lesson = {
  id: 'lesson-6',
  title: 'Stars and Bars',
  subject: 'AP Statistics · Combinatorics',
  order: 6,
  prerequisiteLessonId: 'lesson-5',
  tagline: 'Sharing identical things into groups is just choosing where a few dividers go.',
  completionMessage:
    'You can turn “distribute identical items into groups” into a single combination. Path complete!',
  steps: [
    {
      id: 'step-1-cookies',
      step: 1,
      type: 'stars-bars-solve',
      prompt: 'Hand out 4 identical cookies to 3 kids (a kid may get none). How many ways?',
      items: 4,
      groups: 3,
      itemNoun: 'cookie',
      groupNoun: 'Kid',
      slotsGiven: true,
    },
    {
      id: 'step-2-balloons',
      step: 2,
      type: 'stars-bars-solve',
      prompt: 'Your turn: 6 identical balloons among 4 friends (a friend may get zero).',
      items: 6,
      groups: 4,
      itemNoun: 'balloon',
      groupNoun: 'Friend',
      scaffold: true,
    },
    {
      id: 'step-cookies-build',
      step: 3,
      type: 'equation-build',
      form: 'stars-bars',
      n: 4,
      k: 3,
      nLabel: 'cookies (items)',
      kLabel: 'kids (groups)',
      prompt:
        'You shared the cookies by dropping 2 dividers among 6 spots. Build the formula from the items and the groups.',
      result: 'C(6, 2) = 15',
      ruleName: 'Stars & bars: C(n + k − 1, k − 1)',
    },
    {
      id: 'step-3-rule',
      step: 4,
      type: 'rule-statement',
      explanation:
        'Stars and bars: to share n identical items among k groups (groups may be empty), draw n stars and k − 1 bars in a row. Every arrangement is exactly one way to share, so the answer is the number of ways to place the bars: choose k − 1 positions out of n + (k − 1). That’s the combination C(n + k − 1, k − 1).',
      overlayExpression: 'C(n + k − 1, k − 1)',
    },
    {
      id: 'step-4-cold',
      step: 5,
      type: 'cold-problem',
      problems: [
        {
          id: 'problem-a',
          prompt:
            'You give 5 identical stickers to 3 kids (a kid can get none). How many ways are there?',
          correctValue: 21,
          feedbackWrong: {
            default:
              '5 stars and 3 − 1 = 2 bars make 7 positions. Choose the 2 bar spots: C(7, 2) = (7 × 6) ÷ 2 = 21.',
            specificCases: [
              {
                answer: 243,
                message:
                  'That’s 3⁵ (as if each sticker independently picks a kid), but the stickers are identical. Use stars and bars: C(7, 2) = 21.',
              },
              {
                answer: 10,
                message: 'Close method, wrong row length: 5 stars + 2 bars = 7 positions, so it’s C(7, 2) = 21.',
              },
            ],
          },
        },
        {
          id: 'problem-b',
          prompt:
            'How many ways can you place 4 identical coins into 4 distinct jars (jars may be empty)?',
          correctValue: 35,
          feedbackWrong: {
            default:
              '4 stars and 4 − 1 = 3 bars make 7 positions. Choose the 3 bar spots: C(7, 3) = (7 × 6 × 5) ÷ 6 = 35.',
            specificCases: [
              {
                answer: 256,
                message:
                  'That’s 4⁴, treating coins as distinct. They’re identical, so use stars and bars: C(7, 3) = 35.',
              },
            ],
          },
        },
      ],
    },
  ],
}
