import type { Lesson } from '../types/lesson'

export const lesson2: Lesson = {
  id: 'lesson-2',
  title: 'Permutations & Combinations',
  subject: 'AP Statistics · Combinatorics',
  order: 2,
  prerequisiteLessonId: 'lesson-1',
  tagline: 'Pick winners into podium slots, then watch order stop mattering.',
  completionMessage: 'You can tell permutations from combinations, and you know when to divide.',
  steps: [
    {
      id: 'step-1-podium',
      step: 1,
      type: 'slot-select',
      mode: 'permutation',
      prompt:
        '4 animals race for gold, silver, and bronze. For each medal, say how many racers are still available, then spin to place one.',
      itemNoun: 'racers',
      showTree: true,
      pool: [
        { id: 'tortoise', label: 'Tortoise', emoji: '🐢' },
        { id: 'hare', label: 'Hare', emoji: '🐇' },
        { id: 'fox', label: 'Fox', emoji: '🦊' },
        { id: 'horse', label: 'Horse', emoji: '🐎' },
      ],
      slotLabels: ['Gold', 'Silver', 'Bronze'],
      optionFeedback: {
        default: 'A racer gets placed each round, so the next medal has fewer options.',
        specificCases: [
          {
            answer: 4,
            message: 'A racer just took a medal, so not all 4 are still available. Count the pool.',
          },
        ],
      },
      questions: [
        {
          id: 'total',
          label: 'Total podiums',
          prompt: 'How many different podiums are possible?',
          correctValue: 24,
          revealExpression: '4 × 3 × 2 = 24',
          hintText: 'The options were 4, then 3, then 2. How do sequential choices combine?',
          feedbackWrong: {
            default: 'Sequential choices multiply: 4 × 3 × 2 = 24.',
            specificCases: [
              { answer: 9, message: 'That is 4 + 3 + 2. Sequential choices multiply: 4 × 3 × 2 = 24.' },
              { answer: 64, message: 'That is 4 × 4 × 4, but a winner cannot win twice. The options shrink: 4 × 3 × 2 = 24.' },
            ],
          },
        },
      ],
    },
    {
      id: 'step-2-rule-perm',
      step: 2,
      type: 'rule-statement',
      explanation:
        'A permutation is an arrangement where order matters. Each pick uses one option up, so the choices count down as you go.',
      overlayExpression: 'P(n, k) = n! / (n − k)!',
    },
    {
      id: 'step-3-shelf',
      step: 3,
      type: 'slot-select',
      mode: 'permutation',
      prompt:
        'Your turn. Arrange 3 of these 5 books on a shelf. For each spot, say how many books are still available, then spin.',
      itemNoun: 'books',
      pool: [
        { id: 'red', label: 'Red', emoji: '📕' },
        { id: 'green', label: 'Green', emoji: '📗' },
        { id: 'blue', label: 'Blue', emoji: '📘' },
        { id: 'orange', label: 'Orange', emoji: '📙' },
        { id: 'yellow', label: 'Yellow', emoji: '📒' },
      ],
      slotLabels: ['Left', 'Middle', 'Right'],
      optionFeedback: {
        default: 'Each spot uses up a book, so the next spot has fewer choices.',
        specificCases: [],
      },
      questions: [
        {
          id: 'total',
          label: 'Total arrangements',
          prompt: 'How many different arrangements are there?',
          correctValue: 60,
          revealExpression: '5 × 4 × 3 = 60',
          hintText: 'The options counted down: 5, then 4, then 3.',
          feedbackWrong: {
            default: 'Multiply the shrinking options: 5 × 4 × 3 = 60.',
            specificCases: [
              { answer: 12, message: 'That is 5 + 4 + 3. Multiply instead: 5 × 4 × 3 = 60.' },
            ],
          },
        },
      ],
    },
    {
      id: 'step-4-choose',
      step: 4,
      type: 'slot-select',
      mode: 'combination',
      prompt: 'Now pick 3 of these 5 friends for a team. Same shirt, no ranks.',
      intro: 'Watch what changes once they are just a team.',
      itemNoun: 'friends',
      pool: [
        { id: 'ana', label: 'Ana', emoji: '👧' },
        { id: 'bo', label: 'Bo', emoji: '👦' },
        { id: 'cy', label: 'Cy', emoji: '🧒' },
        { id: 'di', label: 'Di', emoji: '👩' },
        { id: 'ed', label: 'Ed', emoji: '🧑' },
      ],
      slotLabels: ['1st pick', '2nd pick', '3rd pick'],
      optionFeedback: {
        default: 'Each pick uses up a friend.',
        specificCases: [],
      },
      questions: [
        {
          id: 'ordered',
          label: 'If order counted',
          prompt: 'If the pick order counted, how many ordered ways are there?',
          correctValue: 60,
          revealExpression: '5 × 4 × 3 = 60',
          hintText: 'Same as arranging: the options count down 5, 4, 3.',
          feedbackWrong: {
            default: 'With order it is 5 × 4 × 3 = 60.',
            specificCases: [
              { answer: 12, message: 'That is 5 + 4 + 3. Multiply: 5 × 4 × 3 = 60.' },
            ],
          },
        },
        {
          id: 'order',
          label: 'Orders of your group',
          prompt: 'In how many orders could these same 3 friends be arranged?',
          correctValue: 6,
          revealExpression: '3 × 2 × 1 = 6',
          hintText: 'Arrange 3 people: 3, then 2, then 1.',
          feedbackWrong: {
            default: 'Three friends arrange in 3 × 2 × 1 = 6 orders.',
            specificCases: [
              { answer: 3, message: 'Not 3. Three friends can be arranged in 3 × 2 × 1 = 6 orders.' },
            ],
          },
        },
        {
          id: 'choose',
          label: 'Ways to choose',
          prompt: 'Each team got counted once per order. So how many different teams?',
          correctValue: 10,
          revealExpression: '60 ÷ 6 = 10',
          hintText: 'Take the ordered count and divide by the orders of each group.',
          feedbackWrong: {
            default: 'Divide out the orderings: 60 ÷ 6 = 10.',
            specificCases: [
              { answer: 60, message: 'That is the ordered count. Each team was counted 6 times, so divide by 6: 10.' },
            ],
          },
        },
      ],
    },
    {
      id: 'step-5-rule-choose',
      step: 5,
      type: 'rule-statement',
      explanation:
        'A combination is a selection where order does not matter. Count the ordered ways, then divide by the orderings of the chosen group to cancel the repeats.',
      overlayExpression: 'C(n, k) = n! / (k! · (n − k)!)',
    },
    {
      id: 'step-6-scoops',
      step: 6,
      type: 'slot-select',
      mode: 'combination',
      prompt: 'Choose 2 of these 6 flavors for a cup. Order does not matter.',
      itemNoun: 'flavors',
      pool: [
        { id: 'strawberry', label: 'Strawberry', emoji: '🍓' },
        { id: 'chocolate', label: 'Chocolate', emoji: '🍫' },
        { id: 'vanilla', label: 'Vanilla', emoji: '🍦' },
        { id: 'lemon', label: 'Lemon', emoji: '🍋' },
        { id: 'peach', label: 'Peach', emoji: '🍑' },
        { id: 'apple', label: 'Apple', emoji: '🍏' },
      ],
      slotLabels: ['Scoop 1', 'Scoop 2'],
      optionFeedback: { default: 'Each scoop uses up a flavor.', specificCases: [] },
      questions: [
        {
          id: 'ordered',
          label: 'If order counted',
          prompt: 'If order counted, how many ways to pick a 1st then a 2nd flavor?',
          correctValue: 30,
          revealExpression: '6 × 5 = 30',
          hintText: 'Two sequential picks from 6, then 5.',
          feedbackWrong: {
            default: 'With order it is 6 × 5 = 30.',
            specificCases: [
              { answer: 11, message: 'That is 6 + 5. Multiply: 6 × 5 = 30.' },
            ],
          },
        },
        {
          id: 'order',
          label: 'Orders of your group',
          prompt: 'In how many orders could the same 2 scoops sit?',
          correctValue: 2,
          revealExpression: '2 × 1 = 2',
          hintText: 'Two items arrange in 2 ways.',
          feedbackWrong: {
            default: 'Two scoops arrange in 2 × 1 = 2 orders.',
            specificCases: [],
          },
        },
        {
          id: 'choose',
          label: 'Ways to choose',
          prompt: 'So how many different cups are there?',
          correctValue: 15,
          revealExpression: '30 ÷ 2 = 15',
          hintText: 'Divide the ordered count by the orders of each pair.',
          feedbackWrong: {
            default: 'Divide out the orderings: 30 ÷ 2 = 15.',
            specificCases: [
              { answer: 30, message: 'That counts each cup twice. Divide by 2: 15.' },
            ],
          },
        },
      ],
    },
    {
      id: 'step-7-cold',
      step: 7,
      type: 'cold-problem',
      problems: [
        {
          id: 'problem-a',
          prompt:
            'A pizzeria lets you pick 3 different toppings out of 8. The order does not matter. How many topping combinations are there?',
          correctValue: 56,
          feedbackWrong: {
            default: 'Order does not matter, so it is a combination: (8 × 7 × 6) ÷ (3 × 2 × 1) = 56.',
            specificCases: [
              {
                answer: 336,
                message:
                  'That is the ordered count (8 × 7 × 6). Toppings have no order, so divide by 3 × 2 × 1 = 6: you get 56.',
              },
            ],
          },
        },
        {
          id: 'problem-b',
          prompt:
            'A race has 8 runners. Gold, silver, and bronze medals are awarded. How many ways can the medals be handed out?',
          correctValue: 336,
          feedbackWrong: {
            default: 'The medals are distinct, so order matters: 8 × 7 × 6 = 336. Do not divide.',
            specificCases: [
              {
                answer: 56,
                message:
                  'You divided as if order did not matter, but gold, silver, and bronze differ. Keep the orderings: 8 × 7 × 6 = 336.',
              },
            ],
          },
        },
      ],
    },
  ],
}
