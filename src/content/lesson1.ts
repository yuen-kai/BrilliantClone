import type { Lesson } from '../types/lesson'

export const lesson1: Lesson = {
  id: 'lesson-1',
  title: 'Multiplication Principle',
  subject: 'AP Statistics · Combinatorics',
  order: 1,
  prerequisiteLessonId: null,
  steps: [
    {
      id: 'step-1-sandwiches',
      step: 1,
      type: 'visual-interactive',
      prompt:
        'You have 2 breads, 3 meats, and 2 cheeses. Build the decision tree and find how many different sandwiches you can make.',
      visual: {
        component: 'tree-build',
        treeConfig: {
          levels: [
            { label: 'Bread', branchCount: 2 },
            { label: 'Meat', branchCount: 3 },
            { label: 'Cheese', branchCount: 2 },
          ],
        },
      },
      gated: true,
      stages: [
        { kind: 'node-count', branchCount: 2, expectedNodeCount: 2, multiplierLabel: '×2' },
        { kind: 'node-count', branchCount: 3, expectedNodeCount: 6, multiplierLabel: '×3' },
        { kind: 'node-count', branchCount: 2, expectedNodeCount: 12, multiplierLabel: '×2' },
      ],
      finalGate: {
        correctValue: 12,
        prompt: 'How many total sandwiches can you make?',
        hintText: 'Count every complete path from top to bottom of your tree.',
        feedbackWrong: {
          default: 'Not quite. Count every full path through the tree, multiplying at each level.',
          specificCases: [
            {
              answer: 7,
              message:
                'You added 2 + 3 + 2 = 7, but that counts options at each level separately. Look at your tree and count every full path from top to bottom. Each path is one sandwich.',
            },
          ],
        },
      },
      hintText: 'After each split, count how many nodes appear at that level.',
      feedbackWrong: {
        default: 'Count the nodes at this level after the split.',
        specificCases: [],
      },
    },
    {
      id: 'step-2-pizzas',
      step: 2,
      type: 'visual-interactive',
      prompt:
        'A pizza shop offers 3 crusts, 2 sizes, and 3 toppings. Build the tree and find how many different pizzas are possible.',
      visual: {
        component: 'tree-build',
        treeConfig: {
          levels: [
            { label: 'Crust', branchCount: 3 },
            { label: 'Size', branchCount: 2 },
            { label: 'Topping', branchCount: 3 },
          ],
        },
      },
      gated: true,
      stages: [
        { kind: 'dual', branchCount: 3, expectedMultiplier: 3, expectedNodeCount: 3 },
        { kind: 'dual', branchCount: 2, expectedMultiplier: 2, expectedNodeCount: 6 },
        { kind: 'dual', branchCount: 3, expectedMultiplier: 3, expectedNodeCount: 18 },
      ],
      finalGate: {
        correctValue: 18,
        prompt: 'How many total pizzas are possible?',
        hintText: 'Multiply the branch counts at each level.',
        feedbackWrong: {
          default: 'Not quite. Multiply the options at each level together.',
          specificCases: [
            {
              answer: 8,
              message:
                'You may have added 3 + 2 + 3 = 8. Each level multiplies the previous, so count full paths through your tree.',
            },
          ],
        },
      },
      hintText: 'Enter both the branches per node and the total nodes at this level.',
      feedbackWrong: {
        default: 'Check both the multiplier and the total node count.',
        specificCases: [],
      },
    },
    {
      id: 'step-3-padlock',
      step: 3,
      type: 'visual-interactive',
      prompt:
        'A padlock code has 2 letters (2 options each) followed by 1 digit (3 options). Build the tree, and notice the first two levels repeat the same branch count.',
      visual: {
        component: 'tree-build',
        treeConfig: {
          levels: [
            { label: 'Letter 1', branchCount: 2 },
            { label: 'Letter 2', branchCount: 2 },
            { label: 'Digit', branchCount: 3 },
          ],
        },
      },
      gated: true,
      stages: [
        { kind: 'dual', branchCount: 2, expectedMultiplier: 2, expectedNodeCount: 2 },
        { kind: 'dual', branchCount: 2, expectedMultiplier: 2, expectedNodeCount: 4 },
        { kind: 'dual', branchCount: 3, expectedMultiplier: 3, expectedNodeCount: 12 },
      ],
      finalGate: {
        correctValue: 12,
        prompt: 'How many different padlock codes are possible?',
        hintText: 'Even when branch counts repeat, you still multiply, not add.',
        feedbackWrong: {
          default: 'Not quite. Count full paths through the tree.',
          specificCases: [
            {
              answer: 7,
              message:
                'You added 2 + 2 + 3 = 7. Repeating the same branch count (2) does not mean you add. Each level still multiplies. Count every path top to bottom.',
            },
          ],
        },
      },
      hintText: 'Enter both the branches per node and the total nodes at this level.',
      feedbackWrong: {
        default: 'Check both the multiplier and the total node count.',
        specificCases: [],
      },
    },
    {
      id: 'step-4-rule',
      step: 4,
      type: 'rule-statement',
      explanation:
        'When choices happen in sequence, multiply the number of options at each step. If step 1 has a options, step 2 has b options, and step 3 has c options, the total is a × b × c. This is the multiplication principle.',
      referenceStepId: 'step-3-padlock',
      overlayExpression: '2 × 2 × 3 = 12',
    },
    {
      id: 'step-5-cold',
      step: 5,
      type: 'cold-problem',
      problems: [
        {
          id: 'problem-a',
          prompt:
            'A combination lock uses a 2-letter code (26 options each) followed by a 1-digit code (10 options). How many codes are possible?',
          correctValue: 6760,
          feedbackWrong: {
            default:
              'Use the multiplication principle: multiply the options at each step. 26 × 26 × 10.',
            specificCases: [
              {
                answer: 62,
                message:
                  'You may have added 26 + 26 + 10. The multiplication principle says multiply sequential choices: 26 × 26 × 10.',
              },
            ],
          },
        },
        {
          id: 'problem-b',
          prompt:
            'A product key is built by choosing 1 of 3 prefixes, then 1 of 8 colors, then 1 of 4 sizes. How many distinct keys are possible?',
          correctValue: 96,
          feedbackWrong: {
            default: 'Multiply the options at each step: 3 × 8 × 4.',
            specificCases: [
              {
                answer: 15,
                message: 'You may have added 3 + 8 + 4. Multiply instead: 3 × 8 × 4.',
              },
            ],
          },
        },
      ],
    },
  ],
}
