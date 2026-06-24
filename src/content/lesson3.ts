import type { Lesson } from '../types/lesson'

export const lesson3: Lesson = {
  id: 'lesson-3',
  title: 'Overcounting',
  subject: 'AP Statistics · Combinatorics',
  order: 3,
  prerequisiteLessonId: 'lesson-2',
  tagline: 'Count freely, notice the repeats, then divide them away. A counter’s superpower.',
  completionMessage:
    'You can spot when a count double-counts, and divide by exactly the right factor.',
  steps: [
    {
      id: 'step-1-handshakes',
      step: 1,
      type: 'visual-interactive',
      prompt:
        '4 friends are at a party and every pair shakes hands once. To count, first build the tree of ordered greetings: pick who reaches out (4), then who they greet (3).',
      visual: {
        component: 'tree-build',
        treeConfig: {
          levels: [
            { label: 'Greeter', branchCount: 4 },
            { label: 'Greeted', branchCount: 3 },
          ],
        },
      },
      gated: true,
      stages: [
        { kind: 'dual', branchCount: 4, expectedMultiplier: 4, expectedNodeCount: 4 },
        { kind: 'dual', branchCount: 3, expectedMultiplier: 3, expectedNodeCount: 12 },
      ],
      finalGate: {
        correctValue: 6,
        prompt:
          'Your tree shows 12 ordered greetings. But a handshake between A and B is ONE handshake, counted twice here (A→B and B→A). How many actual handshakes happen?',
        hintText: 'Each handshake was counted twice, so divide 12 by 2.',
        feedbackWrong: {
          default: 'Each real handshake appears twice in the tree. Divide: 12 ÷ 2 = 6.',
          specificCases: [
            {
              answer: 12,
              message:
                'That’s the tree’s ordered count, where A→B and B→A are separate. A handshake is one pair, so divide by 2: you get 6.',
            },
            {
              answer: 7,
              message: 'Not a sum. Each of the 12 ordered greetings is one real handshake counted twice: 12 ÷ 2 = 6.',
            },
          ],
        },
      },
      hintText: 'After this split, count how many nodes appear at this level.',
      feedbackWrong: {
        default: 'Count both the branches per node and the total nodes at this level.',
        specificCases: [],
      },
    },
    {
      id: 'step-2-round-table',
      step: 2,
      type: 'guided-solve',
      prompt:
        '5 friends sit around a round table. What matters is who sits next to whom. Rotating everyone one seat over is the same arrangement.',
      intro: 'Count as if seats were labeled, then divide out the rotations that repeat.',
      visual: {
        component: 'round-table',
        seats: [
          { id: 'ana', label: 'Ana', emoji: '👧' },
          { id: 'bo', label: 'Bo', emoji: '👦' },
          { id: 'cy', label: 'Cy', emoji: '🧒' },
          { id: 'di', label: 'Di', emoji: '👩' },
          { id: 'ed', label: 'Ed', emoji: '🧑' },
        ],
      },
      resultLabel: 'distinct arrangements',
      blanks: [
        {
          id: 'labeled',
          label: 'Labeled seatings',
          prompt:
            'If the 5 seats were numbered 1–5, how many ways to seat the friends? (5 × 4 × 3 × 2 × 1)',
          correctValue: 120,
          revealExpression: '5! = 120',
          hintText: 'That’s 5 × 4 × 3 × 2 × 1.',
          feedbackWrong: {
            default: 'With numbered seats it’s 5 × 4 × 3 × 2 × 1 = 120.',
            specificCases: [
              { answer: 25, message: 'Not 5 × 5. Each seat removes a person: 5 × 4 × 3 × 2 × 1 = 120.' },
            ],
          },
        },
        {
          id: 'rotations',
          label: 'Rotations that repeat',
          prompt:
            'Now spin the table. How many rotations of the same circle look identical (including the original)? (One per seat.)',
          correctValue: 5,
          revealExpression: '5 rotations',
          hintText: 'There are as many rotations as there are seats: 5.',
          feedbackWrong: {
            default: 'A circle of 5 can be rotated into 5 positions that all look the same.',
            specificCases: [],
          },
        },
        {
          id: 'divide',
          label: 'Distinct arrangements',
          prompt: 'So how many genuinely different round-table arrangements? (120 ÷ 5)',
          correctValue: 24,
          revealExpression: '120 ÷ 5 = 24',
          hintText: 'Divide the labeled count by the 5 rotations: 120 ÷ 5.',
          feedbackWrong: {
            default: 'Divide out the rotations: 120 ÷ 5 = 24.',
            specificCases: [
              { answer: 120, message: 'That still counts each circle 5 times (once per rotation). Divide by 5: 24.' },
            ],
          },
        },
      ],
    },
    {
      id: 'step-3-letters',
      step: 3,
      type: 'guided-solve',
      prompt:
        'How many different ways can you arrange the letters of the word TOO? The catch: the two O’s are identical, so swapping them changes nothing.',
      intro: 'Pretend the letters are all distinct, then divide by the repeats you can’t see.',
      visual: {
        component: 'duplicate-row',
        word: 'TOO',
        tiles: [
          { id: 't', label: 'T', groupId: 'T' },
          { id: 'o1', label: 'O', groupId: 'O' },
          { id: 'o2', label: 'O', groupId: 'O' },
        ],
      },
      resultLabel: 'distinct words',
      blanks: [
        {
          id: 'distinct',
          label: 'If all letters were distinct',
          prompt:
            'Label them T, O₁, O₂ as if different. How many ways to arrange 3 distinct letters? (3 × 2 × 1)',
          correctValue: 6,
          revealExpression: '3! = 6',
          hintText: 'Three distinct letters arrange in 3 × 2 × 1 ways.',
          feedbackWrong: {
            default: 'Three distinct letters: 3 × 2 × 1 = 6 arrangements.',
            specificCases: [],
          },
        },
        {
          id: 'dup',
          label: 'Hidden duplicates',
          prompt:
            'Swapping O₁ and O₂ gives the same real word. How many of the 6 are secretly identical? (2 × 1 ways to order the O’s)',
          correctValue: 2,
          revealExpression: '2! = 2',
          hintText: 'The two O’s can be ordered in 2 ways that look the same.',
          feedbackWrong: {
            default: 'The two identical O’s can swap in 2 ways, so every word is counted twice.',
            specificCases: [],
          },
        },
        {
          id: 'divide',
          label: 'Distinct words',
          prompt: 'So how many actually-different words? (6 ÷ 2)',
          correctValue: 3,
          revealExpression: '6 ÷ 2 = 3',
          hintText: 'Divide by the repeats: 6 ÷ 2.',
          feedbackWrong: {
            default: 'Divide out the identical O orderings: 6 ÷ 2 = 3. (TOO, OTO, OOT.)',
            specificCases: [
              { answer: 6, message: 'That counts O₁O₂ and O₂O₁ as different, but they look identical. Divide by 2: 3.' },
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
        'Overcounting: count the easy way, even if it counts each real outcome more than once. Then find how many times each was counted and divide by that. Answer = raw count ÷ copies of each.',
      referenceStepId: 'step-1-handshakes',
      overlayExpression: '4 × 3 = 12, then ÷ 2 = 6',
    },
    {
      id: 'step-5-cold',
      step: 5,
      type: 'cold-problem',
      problems: [
        {
          id: 'problem-a',
          prompt:
            '6 people sit around a round table. How many genuinely different seating arrangements are there? (Rotations of the same circle count as one.)',
          correctValue: 120,
          feedbackWrong: {
            default:
              'Labeled seats give 6 × 5 × 4 × 3 × 2 × 1 = 720, but each circle is counted 6 times (one per rotation): 720 ÷ 6 = 120.',
            specificCases: [
              {
                answer: 720,
                message:
                  'That’s the count with numbered seats. At a round table, divide by the 6 rotations: 720 ÷ 6 = 120.',
              },
            ],
          },
        },
        {
          id: 'problem-b',
          prompt:
            'A coach picks 2 players from a squad of 7 to be co-captains (the two roles are identical). How many ways?',
          correctValue: 21,
          feedbackWrong: {
            default:
              'Ordered it’s 7 × 6 = 42, but the two co-captain spots are identical, so each pair is counted twice: 42 ÷ 2 = 21.',
            specificCases: [
              {
                answer: 42,
                message:
                  'That’s 7 × 6, which treats the two captains as ordered. They’re identical roles, so divide by 2: 21.',
              },
            ],
          },
        },
      ],
    },
  ],
}
