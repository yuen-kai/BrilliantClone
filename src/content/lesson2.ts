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
        '4 animals race for gold, silver, bronze. For each medal, how many racers are still available?',
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
        default: 'Once a racer takes a medal, are they still in the running? Count what’s left.',
        specificCases: [
          {
            answer: 4,
            message: 'A racer just took a medal — can they win again? How many are left?',
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
            default: 'Not quite — these are sequential choices. Does adding them match filling all three medals?',
            specificCases: [
              { answer: 9, message: 'That’s 4 + 3 + 2. Each medal is chosen in sequence — should sequential choices add?' },
              { answer: 64, message: 'That’s 4 × 4 × 4 — but can one racer win twice? What happens to the options after each pick?' },
            ],
          },
        },
      ],
    },
    {
      id: 'step-3-shelf',
      step: 2,
      type: 'slot-select',
      mode: 'permutation',
      prompt:
        'Arrange 3 of these 5 books on a shelf. For each spot, how many books are still available?',
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
        default: 'Once a book fills a spot, is it still free? How many are left for the next?',
        specificCases: [],
      },
      questions: [
        {
          id: 'total',
          label: 'Total arrangements',
          prompt: 'How many different arrangements are there?',
          correctValue: 60,
          revealExpression: '5 × 4 × 3 = 60',
          hintText: 'The options counted down: 5, then 4, then 3. How do sequential choices combine?',
          feedbackWrong: {
            default: 'Not quite — the options shrink each pick: 5, then 4, then 3. How do they combine?',
            specificCases: [
              { answer: 12, message: 'That’s 5 + 4 + 3. These are sequential choices — should they add?' },
            ],
          },
        },
      ],
    },
    {
      id: 'step-formula-build',
      step: 3,
      type: 'equation-build',
      form: 'permutation',
      n: 5,
      k: 3,
      lhs: '5 × 4 × 3',
      nLabel: 'total objects',
      kLabel: 'objects to choose',
      prompt: 'Picking 3 of 5 in order, you found 5 × 4 × 3. How do you write that using factorials?',
      result: '5! / 2! = 5 × 4 × 3 = 60',
      ruleName: 'P(n, k) = n! / (n − k)!',
      showSplit: true,
    },
    {
      id: 'step-2-rule-perm',
      step: 4,
      type: 'rule-statement',
      explanation:
        'A permutation is an arrangement where order matters. Each pick uses one option up, so the choices count down as you go.',
      overlayExpression: 'P(n, k) = n! / (n − k)!',
    },
    {
      id: 'step-4-choose',
      step: 5,
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
          label: 'Ignoring repeats',
          prompt: 'If the pick order counted, how many ordered ways are there?',
          correctValue: 60,
          revealExpression: '5 × 4 × 3 = 60',
          hintText: 'Just like arranging books: the options count down 5, 4, 3. How do they combine?',
          feedbackWrong: {
            default: 'With order, it’s just like arranging: 5, then 4, then 3. How do they combine?',
            specificCases: [
              { answer: 12, message: 'That’s 5 + 4 + 3. Sequential picks don’t add — how do they combine?' },
            ],
          },
        },
        {
          id: 'order',
          label: 'Repeats per team',
          prompt: 'In how many orders could these same 3 friends be arranged?',
          correctValue: 6,
          revealExpression: '3 × 2 × 1 = 6',
          hintText: 'Line up just these 3 friends: 3 choices, then 2, then 1. How do they combine?',
          feedbackWrong: {
            default: 'Picture lining up only these 3 friends — 3, then 2, then 1. How do they combine?',
            specificCases: [
              { answer: 3, message: 'Not quite — that’s just the count of friends. In how many orders can 3 of them line up?' },
            ],
          },
        },
        {
          id: 'choose',
          label: 'Considering repeats',
          prompt: 'Each team got counted once per order. So how many different teams?',
          correctValue: 10,
          revealExpression: '60 ÷ 6 = 10',
          hintText: 'Your 60 holds each team once per ordering, and there are 6 orderings each. What should you do to 60?',
          feedbackWrong: {
            default: 'Each team sits in your 60 once for every one of its 6 orderings. How do you collapse those to one?',
            specificCases: [
              { answer: 60, message: 'That’s the ordered count — each team appears 6 times in it. So what should you do?' },
            ],
          },
        },
      ],
    },
    {
      id: 'step-choose-build',
      step: 6,
      type: 'equation-build',
      form: 'choose',
      n: 5,
      k: 3,
      lhs: '(5 × 4 × 3) ÷ (3 × 2 × 1)',
      nLabel: 'total objects',
      kLabel: 'chosen for the group',
      prompt: 'You divided the ordered count by its orderings — now write the whole thing with factorials.',
      result: '5! / (3! · 2!) = 10',
      ruleName: 'C(n, k) = n! / (k! (n − k)!)',
    },
    {
      id: 'step-5-rule-choose',
      step: 7,
      type: 'rule-statement',
      explanation:
        'A combination is a selection where order does not matter. Count the ordered ways, then divide by the orderings of the chosen group to cancel the repeats.',
      overlayExpression: 'C(n, k) = n! / (k! · (n − k)!)',
    },
    {
      id: 'step-6-scoops',
      step: 8,
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
          label: 'Ignoring repeats',
          prompt: 'If order counted, how many ways to pick a 1st then a 2nd flavor?',
          correctValue: 30,
          revealExpression: '6 × 5 = 30',
          hintText: 'Two picks in a row: 6 choices, then 5. How do they combine?',
          feedbackWrong: {
            default: 'If order counted, you pick a 1st then a 2nd: 6, then 5. How do they combine?',
            specificCases: [
              { answer: 11, message: 'That’s 6 + 5. Two sequential picks don’t add — how do they combine?' },
            ],
          },
        },
        {
          id: 'order',
          label: 'Repeats per cup',
          prompt: 'In how many orders could the same 2 scoops sit?',
          correctValue: 2,
          revealExpression: '2 × 1 = 2',
          hintText: 'Swap the two scoops — in how many orders can just 2 items sit?',
          feedbackWrong: {
            default: 'Picture the same 2 scoops — in how many orders can they sit?',
            specificCases: [],
          },
        },
        {
          id: 'choose',
          label: 'Considering repeats',
          prompt: 'So how many different cups are there?',
          correctValue: 15,
          revealExpression: '30 ÷ 2 = 15',
          hintText: 'Your 30 holds each cup once per order of its scoops. What should you do to 30?',
          feedbackWrong: {
            default: 'Each cup sits in your 30 twice, once per order. How do you collapse those to one?',
            specificCases: [
              { answer: 30, message: 'That counts each cup twice, once per order. So what should you do?' },
            ],
          },
        },
      ],
    },
    {
      id: 'step-classify',
      step: 9,
      type: 'classify',
      prompt: 'Permutation or combination? For each one, decide whether the order of the picks matters.',
      scenarios: [
        {
          id: 'c-roles',
          text: 'A club picks a president and then a vice-president from 10 members.',
          answer: 'permutation',
          hint: 'The two roles are different jobs. If you swapped who got which, would it be the same result?',
        },
        {
          id: 'c-books',
          text: 'You grab 5 books off a shelf of 12 to take on vacation.',
          answer: 'combination',
          hint: 'Once all 5 are in your bag, does the order you grabbed them change which books you brought?',
        },
        {
          id: 'c-medals',
          text: 'Gold, silver, and bronze are awarded to 3 of the 7 sprinters in a final.',
          answer: 'permutation',
          hint: 'Gold and bronze are not the same prize. Does it matter who finishes in which place?',
        },
        {
          id: 'c-group',
          text: 'A teacher forms a 3-student study group from a class of 9.',
          answer: 'combination',
          hint: 'A study group has no ranks. Would rearranging the same 3 students make a different group?',
        },
        {
          id: 'c-shelf',
          text: 'Four trophies are placed in a row of 4 distinct spots, chosen from 6 you own.',
          answer: 'permutation',
          hint: 'Each spot in the row is distinct. Does moving a trophy to a different spot change the display?',
        },
      ],
    },
    {
      id: 'step-teach-back',
      step: 10,
      type: 'teach-back',
      concept: 'permutations and combinations',
      prompt:
        "You're the teacher now. Explain the difference between permutations and combinations in your own words — I'll point out anything to fix before your final check.",
      keyPoints: [
        'A permutation is an arrangement where order matters; a combination is a selection where it does not',
        'When you pick in order, the number of options counts down (n, then n − 1, …)',
        'A combination divides the ordered count by the number of orderings of the chosen group (k!)',
        'C(n, k) = n! / (k! (n − k)!)',
      ],
    },
    {
      id: 'step-7-cold',
      step: 11,
      type: 'cold-problem',
      problems: [
        {
          id: 'problem-a',
          prompt:
            'A pizzeria lets you pick 3 different toppings out of 8. The order does not matter. How many topping combinations are there?',
          correctValue: 56,
          feedbackWrong: {
            default: 'Order doesn’t matter here. Count as if it did, then ask how many times each trio repeats. What do you do with those repeats?',
            specificCases: [
              {
                answer: 336,
                message:
                  'That’s the ordered count. The 3 toppings have no order — how many times did each combo show up, and what then?',
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
            default: 'Do gold, silver, and bronze count as different results? If order matters, should you divide anything out?',
            specificCases: [
              {
                answer: 56,
                message:
                  'Looks like you divided out the orderings — but the three medals all differ. Should they be removed here?',
              },
            ],
          },
        },
      ],
    },
  ],
}
