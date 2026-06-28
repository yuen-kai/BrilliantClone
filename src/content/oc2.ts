import type { Lesson } from '../types/lesson'
import type { BacksideAttackConfig } from '../types/orgo'

/** Step 1 — the attack itself: drive HO⁻ into the backside and watch it invert. */
const attackScene: BacksideAttackConfig = {
  groups: ['CH₃', 'H', 'H'],
  leavingGroup: 'Br',
  nucleophile: 'HO⁻',
  backsideToleranceDeg: 45,
}

/** Step 2 — sterics: switch substrate class and watch the opening + rate change. */
const stericsScene: BacksideAttackConfig = {
  groups: ['R', 'R', 'R'],
  leavingGroup: 'Br',
  nucleophile: 'HO⁻',
  backsideToleranceDeg: 45,
  classes: [
    { id: 'methyl', label: 'methyl', relRate: 1000 },
    { id: '1°', label: '1°', relRate: 100 },
    { id: '2°', label: '2°', relRate: 10 },
    { id: '3°', label: '3°', relRate: 0 },
  ],
}

export const oc2: Lesson = {
  id: 'oc-2',
  title: 'SN2: Backside Attack & Inversion',
  subject: 'Organic Chemistry · Mechanisms',
  order: 2,
  prerequisiteLessonId: 'oc-1',
  tagline: 'One push from behind flips the whole carbon inside out.',
  completionMessage: 'You can predict SN2: backside attack, inversion, and why bulk kills the rate.',
  steps: [
    {
      id: 'oc2-attack',
      step: 1,
      type: 'orgo',
      prompt: 'Bromide is on the carbon and hydroxide is waiting below. Drive the reaction.',
      visual: { component: 'backside-attack', config: attackScene },
      gateOnSolved: true,
      gateOnSolvedHint: 'Steer the nucleophile in until it reacts, then answer below.',
      gates: [
        {
          id: 'oc2-attack-side',
          label: 'Approach',
          prompt:
            'The reaction only fired from one direction. Which side of the carbon did the nucleophile have to come from?',
          options: [
            { id: 'opposite', label: 'Opposite the leaving group (backside)' },
            { id: 'same', label: 'The same side as the leaving group' },
            { id: 'either', label: 'Either side' },
          ],
          correctId: 'opposite',
          feedback: {
            wrong: 'Remember what got in the way every other time — the bulky bromide shields its own side.',
            byOption: {
              same: 'That side is taken: the bromine sits there, so the nucleophile bounced off every time.',
              either: 'Only one direction ever triggered the reaction; the rest were blocked.',
            },
          },
        },
        {
          id: 'oc2-attack-config',
          label: 'Configuration',
          prompt:
            'Watch the three other groups as the new bond formed. What happened to the arrangement around the carbon?',
          options: [
            { id: 'invert', label: 'It inverts (umbrella flip)' },
            { id: 'retain', label: 'It stays the same (retention)' },
            { id: 'scramble', label: 'It scrambles to 50:50' },
          ],
          correctId: 'invert',
          feedback: {
            wrong: 'Replay it: the three groups swept all the way through the plane to the far side.',
            byOption: {
              retain: 'They did not stay put — they swung clean through to the opposite face.',
              scramble: 'There was a single product, not a mixture; every hit flipped it the same way.',
            },
          },
        },
      ],
    },
    {
      id: 'oc2-sterics',
      step: 2,
      type: 'orgo',
      prompt: 'Same reaction, four different carbons. Switch between them and compare the opening.',
      visual: { component: 'backside-attack', config: stericsScene },
      gateOnSolved: true,
      gateOnSolvedHint: 'Compare at least the smallest and the bulkiest carbon, then answer below.',
      gates: [
        {
          id: 'oc2-sterics-fast',
          label: 'Fastest',
          prompt: 'Which substrate reacts fastest by SN2?',
          options: [
            { id: 'methyl', label: 'methyl' },
            { id: '1', label: '1° (primary)' },
            { id: '2', label: '2° (secondary)' },
            { id: '3', label: '3° (tertiary)' },
          ],
          correctId: 'methyl',
          feedback: {
            wrong: 'Look again at which carbon gave the longest rate bar and the widest opening.',
            byOption: {
              '3': 'That one barely moved the bar — its opening was crowded shut.',
              '2': 'Its bar was short; a less crowded carbon clearly beat it.',
              '1': 'Close — but one carbon had an even wider opening and a longer bar.',
            },
          },
        },
        {
          id: 'oc2-sterics-why',
          label: 'Why 3°',
          prompt: 'Why is a 3° substrate essentially unreactive in SN2?',
          options: [
            { id: 'sterics', label: 'Bulky groups block the backside' },
            { id: 'electrophilic', label: 'The carbon isn’t electrophilic' },
            { id: 'noLG', label: 'There’s no leaving group' },
          ],
          correctId: 'sterics',
          feedback: {
            wrong: 'You watched the opening shrink as the carbon got more crowded.',
            byOption: {
              electrophilic: 'The carbon is just as electron-poor; the trouble was getting in behind it.',
              noLG: 'The leaving group was still there — the nucleophile just could not reach the carbon.',
            },
          },
        },
      ],
    },
    {
      id: 'oc2-rule',
      step: 3,
      type: 'rule-statement',
      explanation:
        'SN2 is a single, concerted step. The nucleophile attacks the carbon from the side directly opposite the leaving group (Nu–C–LG ≈ 180°) while the C–LG bond breaks, so the three other groups flip through the plane and the configuration inverts (Walden inversion). Because bond-making and bond-breaking happen together, both partners set the rate: rate = k[Nu][substrate] (bimolecular). A crowded carbon blocks the backside, so reactivity drops steeply — methyl > 1° > 2° >> 3°, with 3° essentially unreactive — and strong, unhindered nucleophiles speed it up.',
      overlayExpression: 'rate = k [Nu] [substrate]   ·   backside → inversion',
    },
    {
      id: 'oc2-teach',
      step: 4,
      type: 'teach-back',
      concept: 'the SN2 mechanism',
      problem:
        'Hydroxide (HO⁻) reacts with (S)-2-bromobutane in one step to give 2-butanol. Explain how the nucleophile approaches, what happens to the C–Br bond, what happens to the configuration at that carbon, and what the rate law is.',
      prompt: 'Teach me this reaction. How does HO⁻ get in, and what does that carbon look like before and after?',
      keyPoints: [
        'It is one concerted step — bond-making and bond-breaking happen together (bimolecular)',
        'The nucleophile attacks the carbon from the side directly opposite the leaving group (~180°)',
        'As HO⁻ bonds and Br⁻ leaves, the other three groups flip through the plane, inverting the configuration',
        'The rate law is rate = k[Nu][substrate] — it depends on BOTH concentrations',
        'Sterics set reactivity: methyl and 1° react fast, while 3° is blocked at the backside',
      ],
    },
    {
      id: 'oc2-cold',
      step: 5,
      type: 'cold-problem',
      problems: [
        {
          id: 'oc2-cold-rate',
          prompt:
            'An SN2 reaction follows rate = k[Nu][R–Br]. If you double BOTH [Nu] and [R–Br], the rate is multiplied by ___.',
          correctValue: 4,
          feedbackWrong: {
            default: 'Each concentration is first order, so doubling each contributes a factor of 2 — combine them.',
            specificCases: [
              { answer: 2, message: 'Doubling only one factor gives ×2. Both were doubled, so multiply the two effects.' },
              { answer: 1, message: 'SN2 is bimolecular — changing the concentrations definitely changes the rate.' },
              { answer: 8, message: 'There are only two first-order factors here, not three: 2 × 2, not 2³.' },
            ],
          },
        },
        {
          id: 'oc2-cold-rank',
          prompt:
            'Rank methyl, 1°, 2°, and 3° by SN2 rate. How many of them react faster than the 3° substrate?',
          correctValue: 3,
          feedbackWrong: {
            default: 'The 3° substrate is the slowest of the four — count the ones above it.',
            specificCases: [
              { answer: 4, message: 'A substrate cannot react faster than itself; do not count the 3° one.' },
              { answer: 0, message: '3° is the slowest by SN2, so the other three are all faster.' },
            ],
          },
        },
      ],
    },
  ],
}
