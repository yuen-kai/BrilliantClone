import type { Lesson } from '../types/lesson'

export const lesson6: Lesson = {
  id: 'lesson-6',
  title: 'Stars and Bars',
  subject: 'AP Statistics · Combinatorics',
  order: 6,
  prerequisiteLessonId: 'lesson-5',
  tagline: 'Sharing identical things into groups becomes a row of stars and dividers. Watch.',
  completionMessage:
    'You can turn “distribute identical items into groups” into a single combination. Path complete!',
  steps: [
    {
      id: 'step-1-model',
      step: 1,
      type: 'guided-solve',
      prompt:
        'You’re handing out 4 identical cookies to 3 kids, and a kid is allowed to get none. We’ll picture each way of sharing as a row of stars (cookies) and bars (dividers between kids). Example: ★★ | ★ | ★ means kid 1 gets 2, kid 2 gets 1, kid 3 gets 1.',
      intro: 'First, set up the row of symbols.',
      visual: { component: 'stars-bars', stars: 4, bars: 2, groupNoun: 'Kid' },
      resultLabel: 'symbols in the row',
      blanks: [
        {
          id: 'stars',
          label: 'Stars (cookies)',
          prompt: 'How many stars are in every diagram? (one per cookie)',
          correctValue: 4,
          revealExpression: '4 cookies = 4 ★',
          hintText: 'One star per cookie, and there are 4 cookies.',
          feedbackWrong: {
            default: 'One star per cookie: 4 stars.',
            specificCases: [],
          },
        },
        {
          id: 'bars',
          label: 'Bars (dividers)',
          prompt:
            'To split the cookies among 3 kids, how many dividers (bars) do you need between them?',
          correctValue: 2,
          revealExpression: '3 kids → 2 bars',
          hintText: 'It takes one fewer divider than there are kids: 3 − 1.',
          feedbackWrong: {
            default: 'Separating 3 kids needs 3 − 1 = 2 bars.',
            specificCases: [
              { answer: 3, message: 'Not 3. Dividers go BETWEEN kids, so you need one fewer: 3 − 1 = 2 bars.' },
            ],
          },
        },
        {
          id: 'total',
          label: 'Total symbols',
          prompt: 'How many symbols are in the row altogether? (stars + bars)',
          correctValue: 6,
          revealExpression: '4 + 2 = 6',
          hintText: 'Add the stars and the bars: 4 + 2.',
          feedbackWrong: {
            default: 'Add stars and bars: 4 + 2 = 6 symbols.',
            specificCases: [],
          },
        },
      ],
    },
    {
      id: 'step-2-count',
      step: 2,
      type: 'guided-solve',
      prompt:
        'Here’s the magic: every way of sharing the cookies is just ONE arrangement of those 4 stars and 2 bars in the 6-slot row. Once you decide where the bars go, the stars fill the rest, so the sharing is fixed.',
      intro: 'So counting ways to share = counting where the bars go.',
      visual: { component: 'stars-bars', stars: 4, bars: 2, groupNoun: 'Kid' },
      resultLabel: 'ways to share',
      blanks: [
        {
          id: 'slots',
          label: 'Row positions',
          prompt: 'How many positions are in the row? (you found this last step)',
          correctValue: 6,
          revealExpression: '6 positions',
          hintText: 'It’s the total number of symbols: 6.',
          feedbackWrong: {
            default: 'The row has 4 + 2 = 6 positions.',
            specificCases: [],
          },
        },
        {
          id: 'choose',
          label: 'Ways to place the 2 bars',
          prompt:
            'Choose which 2 of the 6 positions are bars (order among the bars doesn’t matter). How many ways? (6 × 5 ÷ 2)',
          correctValue: 15,
          revealExpression: 'C(6, 2) = 15',
          hintText: 'It’s a combination: (6 × 5) ÷ (2 × 1).',
          feedbackWrong: {
            default: 'Choosing 2 of 6 spots: (6 × 5) ÷ 2 = 15.',
            specificCases: [
              {
                answer: 30,
                message:
                  'That’s 6 × 5, the ordered count. The two bars are identical, so divide by 2: 15.',
              },
            ],
          },
        },
      ],
    },
    {
      id: 'step-3-generalize',
      step: 3,
      type: 'guided-solve',
      prompt:
        'Try it on your own: 6 identical balloons shared among 4 friends (a friend may get zero).',
      intro: 'Same recipe: stars for items, bars for the gaps between groups, then choose the bar positions.',
      visual: { component: 'stars-bars', stars: 6, bars: 3, groupNoun: 'Friend' },
      resultLabel: 'ways to share',
      blanks: [
        {
          id: 'stars',
          label: 'Stars (balloons)',
          prompt: 'How many stars? (one per balloon)',
          correctValue: 6,
          revealExpression: '6 ★',
          hintText: 'One star per balloon: 6.',
          feedbackWrong: { default: 'One star per balloon: 6.', specificCases: [] },
        },
        {
          id: 'bars',
          label: 'Bars (dividers)',
          prompt: 'How many bars to split among 4 friends?',
          correctValue: 3,
          revealExpression: '4 friends → 3 bars',
          hintText: 'One fewer than the number of friends: 4 − 1 = 3.',
          feedbackWrong: {
            default: '4 friends need 4 − 1 = 3 dividers.',
            specificCases: [
              { answer: 4, message: 'Dividers go between friends, so it’s 4 − 1 = 3 bars.' },
            ],
          },
        },
        {
          id: 'total',
          label: 'Total symbols',
          prompt: 'Total positions in the row? (stars + bars)',
          correctValue: 9,
          revealExpression: '6 + 3 = 9',
          hintText: 'Add them: 6 + 3.',
          feedbackWrong: { default: 'Add stars and bars: 6 + 3 = 9.', specificCases: [] },
        },
        {
          id: 'choose',
          label: 'Ways to place the 3 bars',
          prompt:
            'Choose which 3 of the 9 positions are bars: (9 × 8 × 7) ÷ (3 × 2 × 1). How many ways?',
          correctValue: 84,
          revealExpression: 'C(9, 3) = 84',
          hintText: 'Combination: (9 × 8 × 7) ÷ 6.',
          feedbackWrong: {
            default: 'Choosing 3 of 9: (9 × 8 × 7) ÷ 6 = 84.',
            specificCases: [
              {
                answer: 504,
                message: 'That’s 9 × 8 × 7, the ordered count. The 3 bars are identical, so divide by 6: 84.',
              },
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
        'Stars and bars: to share n identical items among k groups (groups may be empty), draw n stars and k − 1 bars in a row. Every arrangement is exactly one way to share, so the answer is the number of ways to place the bars: choose k − 1 positions out of n + (k − 1). That’s the combination C(n + k − 1, k − 1).',
      overlayExpression: 'C(n + k − 1, k − 1)',
    },
    {
      id: 'step-5-cold',
      step: 5,
      type: 'cold-problem',
      problems: [
        {
          id: 'problem-a',
          prompt:
            'You give 5 identical stickers to 3 kids (a kid can get none). How many ways are there? (Hint: 5 stars, 2 bars → choose 2 of 7 positions.)',
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
            'How many ways can you place 4 identical coins into 4 distinct jars (jars may be empty)? (Hint: 4 stars, 3 bars.)',
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
