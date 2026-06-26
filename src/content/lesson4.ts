import type { Lesson } from '../types/lesson'

export const lesson4: Lesson = {
  id: 'lesson-4',
  title: 'Casework',
  subject: 'AP Statistics · Combinatorics',
  order: 4,
  prerequisiteLessonId: 'lesson-3',
  tagline: 'Big messy count? Split it into clean cases, count each, and add them up.',
  completionMessage:
    'You can break a problem into non-overlapping cases, count each, and add across them.',
  steps: [
    {
      id: 'step-1-lunch',
      step: 1,
      type: 'casework',
      prompt: 'Lunch is a burger OR a soup, never both. How many lunches can you build?',
      parentLabel: 'Lunch',
      cases: [
        {
          id: 'burgers',
          label: 'Burgers',
          emoji: '🍔',
          factors: [3, 2],
          question: 'Build-your-own burger: 3 patties, 2 cheeses. How many burgers?',
          correctValue: 6,
          revealExpression: '3 × 2 = 6',
          feedbackWrong: {
            default: 'Inside one burger you pick a patty and a cheese — sequential choices. How do they combine?',
            specificCases: [
              { answer: 5, message: 'That’s 3 + 2. Picking a patty then a cheese are sequential choices — how do they combine?' },
            ],
          },
        },
        {
          id: 'soups',
          label: 'Soups',
          emoji: '🍲',
          factors: [4],
          question: 'Soup of the day: pick 1 of 4 soups. How many soup lunches?',
          correctValue: 4,
          revealExpression: '4 soups',
          feedbackWrong: {
            default: 'No build-your-own here — just the soups. How many are there?',
            specificCases: [],
          },
        },
      ],
      total: {
        question: 'A lunch is a burger or a soup, not both. How many lunches in all?',
        correctValue: 10,
        revealExpression: '6 + 4 = 10',
        feedbackWrong: {
          default: 'Could one lunch be both a burger and a soup? If not, how do the two counts come together?',
          specificCases: [
            {
              answer: 24,
              message:
                'That multiplies the cases — but can one lunch be both? If each is only one case, how should the counts combine?',
            },
          ],
        },
      },
    },
    {
      id: 'step-2-rule',
      step: 2,
      type: 'rule-statement',
      explanation:
        'Casework: split the problem into cases that don’t overlap and together cover everything. Count each case on its own, then add the cases. Multiply within, add across. Total = case 1 + case 2 + …',
      overlayExpression: 'Total = case 1 + case 2 + …',
    },
    {
      id: 'step-teach-back',
      step: 3,
      type: 'teach-back',
      concept: 'casework',
      prompt:
        "You're the teacher now. Explain how casework works in your own words — I'll point out anything to fix before your final check.",
      keyPoints: [
        'Split the problem into cases that don’t overlap and together cover everything',
        'Count each case on its own',
        'Multiply the choices within a single case',
        'Add the case counts together for the total',
      ],
    },
    {
      id: 'step-3-cold',
      step: 4,
      type: 'cold-problem',
      problems: [
        {
          id: 'problem-a',
          prompt:
            'For an outfit you’ll wear EITHER a dress OR a top-and-bottom combo. You own 3 dresses. For the combo you have 4 tops and 2 bottoms. How many outfits are possible?',
          correctValue: 11,
          feedbackWrong: {
            default:
              'Two separate cases: a dress, or a top-and-bottom combo. Count each, and since an outfit is only one case, how do the counts come together?',
            specificCases: [
              {
                answer: 24,
                message:
                  'That multiplies everything — but a dress and a top+bottom combo are separate cases. Can one outfit be both? How should separate cases combine?',
              },
              { answer: 9, message: 'Looks like you added the tops and bottoms — but choosing a top then a bottom are sequential choices. How do those combine before you add the dresses?' },
            ],
          },
        },
        {
          id: 'problem-b',
          prompt:
            'Lunch is EITHER a soup or a sandwich. There are 3 soups. A sandwich is 4 breads and 3 fillings. How many lunches are possible?',
          correctValue: 15,
          feedbackWrong: {
            default:
              'Two cases: soup or sandwich. Count the sandwiches as sequential choices, then ask — can a lunch be both? How do the counts combine?',
            specificCases: [
              {
                answer: 36,
                message:
                  'That multiplies everything — but soup and sandwich are separate cases, and a lunch is only one. How should separate cases combine?',
              },
            ],
          },
        },
      ],
    },
  ],
}
