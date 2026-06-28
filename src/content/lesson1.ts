import type { Lesson } from '../types/lesson'

export const lesson1: Lesson = {
  id: 'lesson-1',
  title: 'Multiplication Principle',
  subject: 'AP Statistics · Combinatorics',
  order: 1,
  prerequisiteLessonId: null,
  tagline: 'Stack a few choices in a row and watch the combinations pile up.',
  steps: [
    {
      id: 'step-1-sandwiches',
      step: 1,
      type: 'visual-interactive',
      prompt: '2 breads, 3 meats, 2 cheeses. How many different sandwiches?',
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
        hintText: 'Each full path from top to bottom is one sandwich. How many complete paths does your tree have?',
        feedbackWrong: {
          default: 'Not quite — adding the levels isn’t the same as counting whole sandwiches. What does one full path give you?',
          specificCases: [
            {
              answer: 7,
              message:
                'Looks like you added 2 + 3 + 2 — but that tallies each level on its own. Trace one full path top to bottom: how many complete paths are there?',
            },
          ],
        },
      },
      hintText: 'After each split, how many nodes appear at the new level?',
      feedbackWrong: {
        default: 'How many nodes are at this level once it splits?',
        specificCases: [],
      },
    },
    {
      id: 'step-2-pizzas',
      step: 2,
      type: 'visual-interactive',
      prompt: 'A pizza shop offers 3 crusts, 2 sizes, and 3 toppings. How many different pizzas?',
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
        hintText: 'Each pizza is one full path top to bottom. How many complete paths are there?',
        feedbackWrong: {
          default: 'Not quite — adding the levels counts parts, not whole pizzas. What does one full path give you?',
          specificCases: [
            {
              answer: 8,
              message:
                'Looks like you added 3 + 2 + 3 — but each level branches off the last. Does adding match the number of full paths? Trace one down.',
            },
          ],
        },
      },
      hintText: 'How many branches grow from each node, and how many nodes is that at this level?',
      feedbackWrong: {
        default: 'Check both: branches per node, and total nodes at this level.',
        specificCases: [],
      },
    },
    {
      id: 'step-3-padlock',
      step: 3,
      type: 'visual-interactive',
      prompt: 'A padlock code has 2 letters (2 options each), then 1 digit (3 options). How many codes?',
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
        hintText: 'Each code is one full path top to bottom — equal branch counts don’t change that. How many paths reach the bottom?',
        feedbackWrong: {
          default: 'Not quite — two levels sharing a branch count doesn’t mean you add. What does one full path give you?',
          specificCases: [
            {
              answer: 7,
              message:
                'Looks like you added 2 + 2 + 3 — equal branch counts can tempt you to add. Does adding count whole codes? Follow a path to the bottom.',
            },
          ],
        },
      },
      hintText: 'How many branches grow from each node, and how many nodes is that at this level?',
      feedbackWrong: {
        default: 'Check both: branches per node, and total nodes at this level.',
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
      id: 'step-teach-back',
      step: 5,
      type: 'teach-back',
      concept: 'the multiplication principle',
      problem:
        'A sandwich shop has 3 breads, 4 fillings, and 2 cheeses. How many different sandwiches can you make?',
      prompt:
        "You're the teacher now — walk me through how you'd solve this, step by step. I'll nudge you if you miss anything.",
      keyPoints: [
        'You multiply the number of options at each step (instead of adding them)',
        'The total is the product, like a × b × c',
      ],
    },
    {
      id: 'step-5-cold',
      step: 6,
      type: 'cold-problem',
      problems: [
        {
          id: 'problem-a',
          prompt:
            'A combination lock uses a 2-letter code (26 options each) followed by a 1-digit code (10 options). How many codes are possible?',
          correctValue: 6760,
          feedbackWrong: {
            default:
              'These are sequential choices, just like the tree. How do the options at each step combine?',
            specificCases: [
              {
                answer: 62,
                message:
                  'Looks like you added 26 + 26 + 10. Each letter and digit is chosen in sequence — how should sequential choices combine?',
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
            default: 'Each key is a sequence: a prefix, then a color, then a size. How do those combine?',
            specificCases: [
              {
                answer: 15,
                message: 'Looks like you added 3 + 8 + 4. These are sequential choices — what should you do instead?',
              },
            ],
          },
        },
      ],
    },
  ],
}
