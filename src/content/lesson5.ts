import type { Lesson } from '../types/lesson'

export const lesson5: Lesson = {
  id: 'lesson-5',
  title: 'Casework',
  subject: 'AP Statistics · Combinatorics',
  order: 5,
  prerequisiteLessonId: 'lesson-4',
  tagline: 'Big messy count? Split it into clean cases, count each, and add them up.',
  completionMessage:
    'You can break a problem into non-overlapping cases, multiply inside each, and add across them.',
  steps: [
    {
      id: 'step-1-burgers',
      step: 1,
      type: 'visual-interactive',
      prompt:
        'A lunch counter offers two kinds of lunch. CASE 1 is a build-your-own burger: 3 patties and 2 cheeses. Build the tree and count the burgers.',
      visual: {
        component: 'tree-build',
        treeConfig: {
          levels: [
            { label: 'Patty', branchCount: 3 },
            { label: 'Cheese', branchCount: 2 },
          ],
        },
      },
      gated: true,
      stages: [
        { kind: 'node-count', branchCount: 3, expectedNodeCount: 3, multiplierLabel: '×3' },
        { kind: 'node-count', branchCount: 2, expectedNodeCount: 6, multiplierLabel: '×2' },
      ],
      finalGate: {
        correctValue: 6,
        prompt: 'How many different burgers are possible?',
        hintText: 'Within one case you still multiply: 3 × 2.',
        feedbackWrong: {
          default: 'Multiply the choices inside this case: 3 × 2 = 6.',
          specificCases: [
            { answer: 5, message: 'That’s 3 + 2. Inside a single case the choices still multiply: 3 × 2 = 6.' },
          ],
        },
      },
      hintText: 'Count the nodes at this level.',
      feedbackWrong: {
        default: 'Count the nodes at this level.',
        specificCases: [],
      },
    },
    {
      id: 'step-2-soups',
      step: 2,
      type: 'visual-interactive',
      prompt:
        'CASE 2 is the soup of the day: just pick one of 4 soups. Build this one-level tree and count the soups.',
      visual: {
        component: 'tree-build',
        treeConfig: {
          levels: [{ label: 'Soup', branchCount: 4 }],
        },
      },
      gated: true,
      stages: [{ kind: 'node-count', branchCount: 4, expectedNodeCount: 4, multiplierLabel: '×4' }],
      finalGate: {
        correctValue: 4,
        prompt: 'How many soup lunches are possible?',
        hintText: 'There are 4 soups and nothing else to choose.',
        feedbackWrong: {
          default: 'It’s just the 4 soups.',
          specificCases: [],
        },
      },
      hintText: 'Count the nodes at this level.',
      feedbackWrong: {
        default: 'Count the nodes at this level.',
        specificCases: [],
      },
    },
    {
      id: 'step-3-combine',
      step: 3,
      type: 'guided-solve',
      prompt:
        'Your lunch is a burger OR a soup, never both. The two cases do not overlap, so combine them.',
      intro: 'Multiply WITHIN a case (you already did). To merge separate cases, ADD.',
      resultLabel: 'lunches',
      blanks: [
        {
          id: 'case1',
          label: 'Case 1: burgers',
          prompt: 'How many burgers did you count in Case 1?',
          correctValue: 6,
          revealExpression: '3 × 2 = 6',
          hintText: 'You found 3 × 2 = 6 burgers.',
          feedbackWrong: {
            default: 'You counted 3 × 2 = 6 burgers in Case 1.',
            specificCases: [],
          },
        },
        {
          id: 'case2',
          label: 'Case 2: soups',
          prompt: 'How many soup lunches in Case 2?',
          correctValue: 4,
          revealExpression: '4 soups',
          hintText: 'There were 4 soups.',
          feedbackWrong: {
            default: 'Case 2 had 4 soups.',
            specificCases: [],
          },
        },
        {
          id: 'total',
          label: 'Total lunches',
          prompt:
            'A lunch is one case or the other, never both. So how many lunches in total? (6 and 4)',
          correctValue: 10,
          revealExpression: '6 + 4 = 10',
          hintText: 'Cases don’t overlap, so add them: 6 + 4.',
          feedbackWrong: {
            default: 'Add the separate cases: 6 + 4 = 10.',
            specificCases: [
              {
                answer: 24,
                message:
                  'Do not multiply cases; that’s for sequential choices. A lunch is a burger OR a soup, so ADD: 6 + 4 = 10.',
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
        'Casework: split the problem into cases that do not overlap and together cover everything. Count each case on its own (usually by multiplying within a case), then add the cases. Multiply within, add across. Total = case 1 + case 2 + …',
      referenceStepId: 'step-1-burgers',
      overlayExpression: 'One case: 3 × 2 = 6, then add the other cases',
    },
    {
      id: 'step-5-cold',
      step: 5,
      type: 'cold-problem',
      problems: [
        {
          id: 'problem-a',
          prompt:
            'For an outfit you’ll wear EITHER a dress OR a top-and-bottom combo. You own 3 dresses. For the combo you have 4 tops and 2 bottoms. How many outfits are possible?',
          correctValue: 11,
          feedbackWrong: {
            default:
              'Case 1 (dress) = 3. Case 2 (top × bottom) = 4 × 2 = 8. They don’t overlap, so add: 3 + 8 = 11.',
            specificCases: [
              {
                answer: 24,
                message:
                  'You multiplied the cases (3 × 4 × 2). But a dress and a top+bottom are separate cases, so count each (3 and 8) and add: 11.',
              },
              { answer: 9, message: 'Inside Case 2 you multiply: 4 × 2 = 8. Then add Case 1: 3 + 8 = 11.' },
            ],
          },
        },
        {
          id: 'problem-b',
          prompt:
            'Lunch is EITHER a soup or a sandwich. There are 3 soups. A sandwich is 4 breads × 3 fillings. How many lunches are possible?',
          correctValue: 15,
          feedbackWrong: {
            default:
              'Case 1 (soup) = 3. Case 2 (sandwich) = 4 × 3 = 12. Add the cases: 3 + 12 = 15.',
            specificCases: [
              {
                answer: 36,
                message:
                  'That’s 3 × 4 × 3, multiplying the cases. Soup and sandwich are separate cases: count each and add, 3 + 12 = 15.',
              },
            ],
          },
        },
      ],
    },
  ],
}
