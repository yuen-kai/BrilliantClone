import type { Lesson } from '../types/lesson'
import type { ArrowPushConfig } from '../types/orgo'

/** Scene 1 — hydroxide's lone pair attacks a methyl cation (one arrow). */
const bondScene: ArrowPushConfig = {
  atoms: [
    { id: 'O', label: 'O', x: 70, y: 150, charge: -1, lonePairs: 3, role: 'nucleophile' },
    { id: 'Hh', label: 'H', x: 44, y: 118 },
    { id: 'C', label: 'C', x: 210, y: 150, charge: 1, role: 'electrophile' },
    { id: 'H1', label: 'H', x: 210, y: 104 },
    { id: 'H2', label: 'H', x: 178, y: 198 },
    { id: 'H3', label: 'H', x: 242, y: 198 },
  ],
  bonds: [
    { id: 'oh', a: 'O', b: 'Hh' },
    { id: 'c1', a: 'C', b: 'H1' },
    { id: 'c2', a: 'C', b: 'H2' },
    { id: 'c3', a: 'C', b: 'H3' },
  ],
  tails: [{ id: 't-o', kind: 'lone-pair', on: 'O', x: 104, y: 150 }],
  heads: [{ id: 'h-c', kind: 'atom', on: 'C', x: 180, y: 150 }],
  solution: [{ id: 'a1', from: 't-o', to: 'h-c' }],
  formBonds: [{ a: 'O', b: 'C' }],
  caption: 'Drag from the lone pair (●) on O to the positive carbon.',
  hint: 'The arrow starts on the electrons (the lone pair on O) and points at the electron-poor C⁺.',
}

/** Scene 2 — substitution: hydroxide attacks while C–Br breaks (two arrows). */
const subScene: ArrowPushConfig = {
  atoms: [
    { id: 'O', label: 'O', x: 58, y: 150, charge: -1, lonePairs: 3, role: 'nucleophile' },
    { id: 'Hh', label: 'H', x: 34, y: 120 },
    { id: 'C', label: 'C', x: 168, y: 150, delta: 'plus', role: 'electrophile' },
    { id: 'H1', label: 'H', x: 168, y: 104 },
    { id: 'H2', label: 'H', x: 140, y: 200 },
    { id: 'H3', label: 'H', x: 196, y: 200 },
    { id: 'Br', label: 'Br', x: 250, y: 150, role: 'leaving' },
  ],
  bonds: [
    { id: 'oh', a: 'O', b: 'Hh' },
    { id: 'c1', a: 'C', b: 'H1' },
    { id: 'c2', a: 'C', b: 'H2' },
    { id: 'c3', a: 'C', b: 'H3' },
    { id: 'cbr', a: 'C', b: 'Br' },
  ],
  tails: [
    { id: 't-o', kind: 'lone-pair', on: 'O', x: 92, y: 150 },
    { id: 't-cbr', kind: 'bond', on: 'cbr', x: 209, y: 150 },
  ],
  heads: [
    { id: 'h-c', kind: 'atom', on: 'C', x: 140, y: 150 },
    { id: 'h-br', kind: 'atom', on: 'Br', x: 250, y: 126 },
  ],
  solution: [
    { id: 'a1', from: 't-o', to: 'h-c' },
    { id: 'a2', from: 't-cbr', to: 'h-br' },
  ],
  formBonds: [{ a: 'O', b: 'C' }],
  breakBonds: ['cbr'],
  leavingId: 'Br',
  caption: 'Two arrows: form the new O–C bond, and break C–Br.',
  hint: 'One arrow makes the new bond (O → C); the other breaks the old one (C–Br → Br).',
}

export const oc1: Lesson = {
  id: 'oc-1',
  title: 'Curved Arrows: Nucleophiles & Electrophiles',
  subject: 'Organic Chemistry · Mechanisms',
  order: 1,
  prerequisiteLessonId: null,
  tagline: 'Every mechanism is just electrons moving. Learn to push the arrows.',
  completionMessage: 'You can read and draw the language of every reaction: curved arrows.',
  steps: [
    {
      id: 'oc1-bond',
      step: 1,
      type: 'orgo',
      prompt: 'Make the new bond. Push the electrons where they need to go.',
      visual: { component: 'arrow-push', config: bondScene },
      gateOnSolved: true,
      gateOnSolvedHint: 'Draw the arrow to form the bond, then answer below.',
      gates: [
        {
          id: 'oc1-bond-nu',
          label: 'Nucleophile',
          prompt: 'Your arrow ran from one species to the other. Which one is the nucleophile?',
          options: [
            { id: 'oh', label: 'HO⁻' },
            { id: 'c', label: 'C⁺' },
          ],
          correctId: 'oh',
          feedback: {
            wrong: 'The arrow’s tail sits on the electrons — that source is the nucleophile.',
            byOption: { c: 'C⁺ is electron-poor; it received the electrons. It’s the electrophile.' },
          },
        },
        {
          id: 'oc1-bond-e',
          label: 'Electrons',
          prompt: 'A curved arrow shows electrons moving. How many electrons does one arrow move?',
          correctValue: 2,
          feedbackWrong: {
            default: 'A double-barbed curved arrow always pushes a pair.',
            specificCases: [
              { answer: 1, message: 'One barb = one electron. A full (double-barbed) arrow has two.' },
              { answer: 4, message: 'That would be two arrows. One arrow moves a single pair.' },
            ],
          },
          revealExpression: '2 e⁻',
        },
      ],
    },
    {
      id: 'oc1-sub',
      step: 2,
      type: 'orgo',
      prompt: 'Same idea, with a leaving group. Form one bond as another breaks.',
      visual: { component: 'arrow-push', config: subScene },
      gateOnSolved: true,
      gateOnSolvedHint: 'Draw both arrows, then answer below.',
      gates: [
        {
          id: 'oc1-sub-count',
          label: 'Arrows',
          prompt: 'How many curved arrows did this reaction take?',
          correctValue: 2,
          feedbackWrong: {
            default: 'One arrow makes the new bond; a second breaks the old one.',
            specificCases: [{ answer: 1, message: 'A bond also had to break — that needs its own arrow.' }],
          },
          revealExpression: '2 arrows',
        },
        {
          id: 'oc1-sub-lg',
          label: 'Leaving group',
          prompt: 'What left, taking the bonding electrons with it?',
          options: [
            { id: 'br', label: 'Br⁻' },
            { id: 'h', label: 'H⁺' },
            { id: 'oh', label: 'HO⁻' },
          ],
          correctId: 'br',
          feedback: {
            wrong: 'Follow the second arrow: the C–Br electrons collapsed onto one atom, which drifted away.',
            byOption: { oh: 'HO⁻ came in as the nucleophile — it arrived, it didn’t leave.' },
          },
        },
      ],
    },
    {
      id: 'oc1-rule',
      step: 3,
      type: 'rule-statement',
      explanation:
        'A nucleophile is electron-rich — it has a lone pair or a negative charge to give. An electrophile is electron-poor — a positive charge, an empty orbital, or a δ+ atom. Every curved arrow starts on electrons and points to the electrophile, and each arrow moves exactly two electrons. Make a bond, break a bond — that is all a mechanism is.',
      overlayExpression: 'tail = electrons  →  head = electrophile   ( 2 e⁻ per arrow )',
    },
    {
      id: 'oc1-teach',
      step: 4,
      type: 'teach-back',
      concept: 'nucleophiles, electrophiles, and curved arrows',
      problem:
        'Hydroxide (HO⁻) reacts with bromomethane (CH₃Br) to give CH₃OH and Br⁻. Using curved arrows, explain which species is the nucleophile, which is the electrophile, and where each arrow begins and ends.',
      prompt:
        'Teach me this reaction. Which species attacks, which gets attacked, and what do the arrows do?',
      keyPoints: [
        'HO⁻ is the nucleophile: it is electron-rich (lone pairs / negative charge) and donates electrons',
        'The carbon is the electrophile: it is electron-poor (δ+ because Br pulls electron density)',
        'An arrow’s tail starts on electrons — a lone pair or a bond — never on a positive atom',
        'An arrow’s head points to where the new bond forms (the electrophilic carbon)',
        'Each curved arrow moves two electrons; as O–C forms, C–Br breaks and Br⁻ leaves',
      ],
    },
    {
      id: 'oc1-cold',
      step: 5,
      type: 'cold-problem',
      problems: [
        {
          id: 'oc1-cold-a',
          prompt: 'A single curved (double-barbed) arrow shows electrons in motion. How many electrons does one arrow move?',
          correctValue: 2,
          feedbackWrong: {
            default: 'Each curved arrow pushes one pair of electrons.',
            specificCases: [
              { answer: 1, message: 'A half-arrow (one barb) moves one electron; a full arrow moves two.' },
            ],
          },
        },
        {
          id: 'oc1-cold-b',
          prompt: 'Of HO⁻, H₂O, BF₃, and NH₃, how many are nucleophiles (electron-rich, able to donate a lone pair)?',
          correctValue: 3,
          feedbackWrong: {
            default: 'A nucleophile must have a lone pair or negative charge to give. One of these is electron-deficient.',
            specificCases: [
              { answer: 4, message: 'BF₃ has an empty orbital on boron — it is an electrophile, not a nucleophile.' },
            ],
          },
        },
      ],
    },
  ],
}
