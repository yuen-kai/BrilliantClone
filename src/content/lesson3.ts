import type { Lesson } from '../types/lesson'

export const lesson3: Lesson = {
  id: 'lesson-3',
  title: 'Overcounting',
  subject: 'AP Statistics · Combinatorics',
  order: 3,
  prerequisiteLessonId: 'lesson-2',
  tagline:
    'Lesson 2 divided out one kind of repeat — the orderings of your group. Now meet the others.',
  completionMessage:
    'You can spot when a count repeats itself and divide by exactly the right factor.',
  steps: [
    {
      id: 'step-1-handshakes',
      step: 1,
      type: 'discovery',
      prompt: 'Four friends meet, and each pair shakes hands once. How many handshakes?',
      visual: {
        component: 'handshake-connect',
        config: {
          people: [
            { id: 'ana', label: 'Ana', emoji: '👧' },
            { id: 'bo', label: 'Bo', emoji: '👦' },
            { id: 'cy', label: 'Cy', emoji: '🧒' },
            { id: 'di', label: 'Di', emoji: '👩' },
          ],
        },
      },
      gates: [
        {
          id: 'ignoring',
          label: 'If direction mattered',
          prompt: 'If a greeting from Ana to Bo counted as different from Bo to Ana, how many greetings would there be?',
          correctValue: 12,
          revealExpression: '4 × 3 = 12',
          hintText: 'Each of the 4 friends greets the other 3. How do those combine?',
          feedbackWrong: {
            default: 'Count every direction separately first. How many others can each friend greet?',
            specificCases: [
              { answer: 6, message: 'That looks merged already — Ana–Bo counted once. First keep both directions apart: how many greetings?' },
            ],
          },
        },
        {
          id: 'considering',
          label: 'Actual handshakes',
          prompt: 'A handshake is the same both ways, so how many actual handshakes happen?',
          correctValue: 6,
          revealExpression: '12 ÷ 2 = 6',
          hintText: 'Each handshake landed in your 12 twice. What should you do to 12 to undo that?',
          feedbackWrong: {
            default: 'When Ana shakes Bo’s hand, how many times did your count of 12 include that one handshake?',
            specificCases: [
              { answer: 12, message: 'That still counts both directions apart. Each handshake sits in that 12 twice — so what now?' },
            ],
          },
        },
      ],
    },
    {
      id: 'step-2-round-table',
      step: 2,
      type: 'discovery',
      prompt: 'Five friends sit around a round table; only who’s next to whom matters. How many seatings?',
      visual: {
        component: 'round-rotations',
        seats: [
          { id: 'ana', label: 'Ana', emoji: '👧' },
          { id: 'bo', label: 'Bo', emoji: '👦' },
          { id: 'cy', label: 'Cy', emoji: '🧒' },
          { id: 'di', label: 'Di', emoji: '👩' },
          { id: 'ed', label: 'Ed', emoji: '🧑' },
        ],
      },
      gates: [
        {
          id: 'ignoring',
          label: 'In a line',
          prompt: 'What would the answer be if the 5 friends sat in a line instead of a circle?',
          correctValue: 120,
          revealExpression: '5! = 120',
          hintText: 'A row fills one seat at a time: 5, then 4, 3, 2, 1. How do sequential choices combine?',
          feedbackWrong: {
            default: 'In a row, every order is its own seating. How many orderings of 5?',
            specificCases: [
              { answer: 24, message: 'That looks like the rotations are already merged. In a row, how many orderings?' },
            ],
          },
        },
        {
          id: 'considering',
          label: 'Around the table',
          prompt: 'Now they’re at a round table, so rotations are the same seating. How many seatings are truly different?',
          correctValue: 24,
          revealExpression: '120 ÷ 5 = 24',
          hintText: 'Each circle appears once for every rotation — 5 of them. What should you do to 120 to remove the copies?',
          feedbackWrong: {
            default: 'Spin everyone one seat over — new seating or the same one? How many copies of each circle did the row make?',
            specificCases: [
              { answer: 120, message: 'That’s the row count, where each circle appears once for every rotation. So what should you do to it?' },
            ],
          },
        },
      ],
    },
    {
      id: 'step-3-letters',
      step: 3,
      type: 'discovery',
      prompt: 'Rearrange TOO into every different word. How many are there?',
      visual: {
        component: 'anagram-board',
        config: {
          word: 'TOO',
          tiles: [
            { id: 't', label: 'T', groupId: 'T' },
            { id: 'o1', label: 'O', groupId: 'O' },
            { id: 'o2', label: 'O', groupId: 'O' },
          ],
        },
      },
      gates: [
        {
          id: 'ignoring',
          label: 'If letters differed',
          prompt: 'If all three letters were different from each other, how many orderings would there be?',
          correctValue: 6,
          revealExpression: '3! = 6',
          hintText: 'Three distinct tiles in a row: 3 choices, then 2, then 1. How do they combine?',
          feedbackWrong: {
            default: 'If both O’s were distinct, they’re just 3 different tiles. How many ways to order them?',
            specificCases: [
              { answer: 3, message: 'That looks like the O’s are already merged. Keeping them distinct, how many orderings?' },
            ],
          },
        },
        {
          id: 'considering',
          label: 'Truly different',
          prompt: 'But the two O’s are identical, so some orderings look the same. How many words actually look different?',
          correctValue: 3,
          revealExpression: '6 ÷ 2 = 3',
          hintText: 'Each word appears twice, once for each way to swap the O’s. What should you do to 6 to merge those?',
          feedbackWrong: {
            default: 'Swap the two O’s in any word — does it change? How many of your 6 look truly different?',
            specificCases: [
              { answer: 6, message: 'That still counts O₁O₂ and O₂O₁ apart, but they read the same. So what should you do to it?' },
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
        'Overcounting: count the easy way even if it counts each real outcome more than once. Find how many copies you made of each, then divide by that. Answer = raw count ÷ copies.',
      overlayExpression: 'answer = raw count ÷ copies of each',
    },
    {
      id: 'step-5-cold',
      step: 5,
      type: 'cold-problem',
      problems: [
        {
          id: 'problem-a',
          prompt: '6 people at a round table. How many distinct seatings? (Rotations count as one.)',
          correctValue: 120,
          feedbackWrong: {
            default: 'Same idea as the table: count as if the seats were numbered, then handle the rotations that repeat each circle. What do you do with those copies?',
            specificCases: [
              { answer: 720, message: 'That’s the numbered-seat count. Each circle repeats once per rotation — how many rotations, and what then?' },
            ],
          },
        },
        {
          id: 'problem-b',
          prompt: 'Pick 2 of 7 players as co-captains (identical roles). How many ways?',
          correctValue: 21,
          feedbackWrong: {
            default: 'Count it as if the two captain spots were ranked, then ask: do the roles actually differ? If not, how many times is each pair counted?',
            specificCases: [
              { answer: 42, message: 'That ranks the two captains, but it’s the same role. How many times did each pair get counted?' },
            ],
          },
        },
      ],
    },
  ],
}
