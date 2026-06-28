import type { Lesson } from '../types/lesson'

/**
 * Reaction Mechanisms · Lesson 1 — Curved Arrows: Nucleophiles & Electrophiles.
 * The course's toolkit: drag a double-barbed arrow from electron-rich (a lone
 * pair / bond) to electron-poor, and when the target is already full, a second
 * arrow breaks a bond so a leaving group departs.
 */
export const lessonRxn1: Lesson = {
  id: 'rxn-1',
  title: 'Curved Arrows',
  subject: 'Organic Chemistry · Substitution & Elimination',
  order: 1,
  prerequisiteLessonId: null,
  tagline: 'Every reaction is electrons moving from rich to poor. Learn to draw the move.',
  steps: [
    {
      id: 'rxn1-step1',
      step: 1,
      type: 'mechanism',
      prompt: 'Ammonia (N, with a lone pair) meets a bare proton, H⁺. Make the bond.',
      gateOnSolved: true,
      visual: {
        component: 'mechanism-canvas',
        config: {
          mode: 'bond',
          caption: 'Drag the lone pair to the proton.',
          hint: 'Arrows start on electrons (the lone pair) and point to the electron-poor H⁺.',
          atoms: [
            { id: 'n', label: 'N', x: 124, y: 116, lonePairs: 1, role: 'nucleophile' },
            { id: 'h', label: 'H', x: 204, y: 116, charge: 1, role: 'electrophile' },
          ],
          bonds: [],
          tails: [{ id: 'n-lp', kind: 'lone-pair', on: 'n', x: 124, y: 89 }],
          heads: [{ id: 'h-orb', kind: 'empty-orbital', on: 'h', x: 204, y: 116 }],
          solution: [{ tail: 'n-lp', head: 'h-orb' }],
          // Product: the lone pair becomes an N–H bond → NH₄⁺ (+ moves to N, H⁺ neutralised).
          formBonds: [{ id: 'nh', a: 'n', b: 'h' }],
          chargeAfter: { n: 1, h: 0 },
        },
      },
      gates: [
        {
          id: 'rxn1-s1-source',
          label: 'Electron source',
          prompt: 'Where did the electrons that formed the bond come from?',
          options: [
            { id: 'lp', label: "Nitrogen's lone pair" },
            { id: 'bond', label: 'An N–H bond' },
            { id: 'charge', label: "Hydrogen's + charge" },
          ],
          correctId: 'lp',
          feedback: {
            wrong: 'An arrow starts on a pair of electrons — a lone pair or a bond, never a charge.',
            byOption: {
              charge: 'A "+" is the absence of electrons — arrows never start there. What had a lone pair to give?',
            },
          },
        },
        {
          id: 'rxn1-s1-charge',
          label: 'New charge',
          prompt: 'Which atom is now positively charged?',
          options: [
            { id: 'n', label: 'Nitrogen' },
            { id: 'h', label: 'Hydrogen' },
          ],
          correctId: 'n',
          feedback: {
            wrong: 'The atom that gave away a share of its lone pair to form a new bond carries the +.',
          },
        },
      ],
    },
    {
      id: 'rxn1-step2',
      step: 2,
      type: 'mechanism',
      prompt: 'Now the proton arrives bonded to chlorine, as H–Cl.',
      gateOnSolved: true,
      visual: {
        component: 'mechanism-canvas',
        config: {
          mode: 'bond',
          caption: 'Two arrows: lone pair to H, and break the H–Cl bond onto Cl.',
          hint: 'H can hold only 2 electrons. To bond it to N, the H–Cl bond must break.',
          atoms: [
            { id: 'n', label: 'N', x: 80, y: 120, lonePairs: 1, role: 'nucleophile' },
            { id: 'h', label: 'H', x: 175, y: 120, role: 'electrophile' },
            { id: 'cl', label: 'Cl', x: 250, y: 120, lonePairs: 3, role: 'leaving' },
          ],
          bonds: [{ id: 'h-cl', a: 'h', b: 'cl', order: 1 }],
          tails: [
            { id: 'n-lp', kind: 'lone-pair', on: 'n', x: 80, y: 92 },
            { id: 'hcl-bond', kind: 'bond', on: 'h-cl', x: 212, y: 120 },
          ],
          heads: [
            { id: 'h-head', kind: 'atom', on: 'h', x: 175, y: 120 },
            { id: 'cl-head', kind: 'atom', on: 'cl', x: 250, y: 120 },
          ],
          solution: [
            { tail: 'n-lp', head: 'h-head' },
            { tail: 'hcl-bond', head: 'cl-head' },
          ],
          // Product: NH₄⁺ + Cl⁻ — N–H forms, H–Cl breaks, Cl leaves with the pair.
          formBonds: [{ id: 'nh', a: 'n', b: 'h' }],
          breakBonds: ['h-cl'],
          chargeAfter: { n: 1, cl: -1 },
        },
      },
      gates: [
        {
          id: 'rxn1-s2-count',
          label: 'Electrons on H',
          prompt: 'With just the N→H arrow drawn, how many electrons would crowd around H?',
          correctValue: 4,
          hintText: 'H started with 2 (its bond to Cl) and the lone pair brings 2 more.',
          feedbackWrong: {
            default: 'Count the H–Cl bonding pair (2) plus the incoming lone pair (2).',
            specificCases: [{ answer: 2, message: 'That ignores the new bond — the lone pair adds 2 more.' }],
          },
        },
        {
          id: 'rxn1-s2-leave',
          label: 'Leaving group',
          prompt: 'What leaves, carrying the bonding pair with it?',
          options: [
            { id: 'cl', label: 'Cl⁻' },
            { id: 'h', label: 'H⁺' },
            { id: 'n', label: 'N' },
          ],
          correctId: 'cl',
          feedback: {
            wrong: 'The atom whose bond was broken leaves — and it keeps both electrons, so it is negative.',
          },
        },
      ],
    },
    {
      id: 'rxn1-step3',
      step: 3,
      type: 'mechanism',
      prompt: 'Hydroxide (⁻OH) meets bromomethane, CH₃–Br.',
      gateOnSolved: true,
      visual: {
        component: 'mechanism-canvas',
        config: {
          mode: 'bond',
          caption: 'Oxygen attacks the carbon; bromine has to go.',
          hint: 'Carbon already has 4 bonds (a full octet). A new bond means the C–Br bond must break.',
          atoms: [
            { id: 'o', label: 'O', x: 78, y: 120, charge: -1, lonePairs: 3, role: 'nucleophile' },
            { id: 'c', label: 'C', x: 178, y: 120, role: 'electrophile' },
            { id: 'br', label: 'Br', x: 252, y: 120, lonePairs: 3, role: 'leaving' },
          ],
          bonds: [{ id: 'c-br', a: 'c', b: 'br', order: 1 }],
          tails: [
            { id: 'o-lp', kind: 'lone-pair', on: 'o', x: 78, y: 92 },
            { id: 'cbr-bond', kind: 'bond', on: 'c-br', x: 215, y: 120 },
          ],
          heads: [
            { id: 'c-head', kind: 'atom', on: 'c', x: 178, y: 120 },
            { id: 'br-head', kind: 'atom', on: 'br', x: 252, y: 120 },
          ],
          solution: [
            { tail: 'o-lp', head: 'c-head' },
            { tail: 'cbr-bond', head: 'br-head' },
          ],
          // Product: O–C forms, C–Br breaks; the once-anionic O is now neutral, Br leaves as Br⁻.
          formBonds: [{ id: 'oc', a: 'o', b: 'c' }],
          breakBonds: ['c-br'],
          chargeAfter: { o: 0, br: -1 },
        },
      },
      gates: [
        {
          id: 'rxn1-s3-why',
          label: 'Why two arrows',
          prompt: 'Why does forming the O–C bond force a second arrow?',
          options: [
            { id: 'octet', label: 'Carbon already has a full octet' },
            { id: 'o', label: 'Oxygen needs more electrons' },
            { id: 'br', label: 'Bromine is positively charged' },
          ],
          correctId: 'octet',
          feedback: {
            wrong: 'Carbon has 4 bonds already. A 5th bond is impossible — so one bond must break as the new one forms.',
          },
        },
        {
          id: 'rxn1-s3-leave',
          label: 'Leaving group',
          prompt: 'What leaves?',
          options: [
            { id: 'br', label: 'Br⁻' },
            { id: 'h', label: 'H⁻' },
            { id: 'o', label: 'O' },
          ],
          correctId: 'br',
          feedback: { wrong: 'The bond that broke was C–Br, so bromine departs (with the electrons → Br⁻).' },
        },
      ],
    },
    {
      id: 'rxn1-rule',
      step: 4,
      type: 'rule-statement',
      explanation:
        'A curved arrow shows an electron PAIR moving from electron-rich (a lone pair, a π bond, or a negative charge — the nucleophile) to electron-poor (a positive charge or empty orbital — the electrophile). The tail sits on the electrons; the head points to where the new bond forms. If the target atom is already full, a second arrow must break a bond so a leaving group can depart with its electrons. Arrows never start on a + or on a bare atom.',
      overlayExpression: 'rich  →  poor   ·   tail on electrons, head on the new bond',
    },
    {
      id: 'rxn1-teach',
      step: 5,
      type: 'teach-back',
      concept: 'how electrons flow from a nucleophile to an electrophile with curved arrows',
      problem: 'Draw the curved arrow(s) for methoxide (CH₃O⁻) reacting with H–Br.',
      prompt:
        "You're the chemist — walk me through which arrows you'd draw and why. I'll nudge you if a rule slips.",
      keyPoints: [
        'The tail sits on a lone pair of the methoxide oxygen (electron-rich), not on the atom or its charge',
        'Electrons flow to the electron-poor H; a second arrow breaks the H–Br bond because H can hold only 2 electrons',
        'Bromine leaves with the bonding pair as Br⁻',
      ],
    },
    {
      id: 'rxn1-cold',
      step: 6,
      type: 'cold-problem',
      problems: [
        {
          id: 'rxn1-cold-a',
          prompt:
            'Fluoride (F⁻) reacts with BF₃, where boron has only 6 electrons (an empty orbital). How many curved arrows does this step need?',
          correctValue: 1,
          feedbackWrong: {
            default: 'Boron has an empty orbital, so it can accept a new bond without anything leaving.',
            specificCases: [
              { answer: 2, message: 'A second (bond-breaking) arrow is only needed when the target is already full. Boron has room — it has just 6 electrons.' },
            ],
          },
        },
        {
          id: 'rxn1-cold-b',
          prompt:
            'Water (H₂O) reacts with H–Br to give H₃O⁺ and Br⁻. How many curved arrows does this step need?',
          correctValue: 2,
          feedbackWrong: {
            default: 'H can hold only 2 electrons, so bonding it to oxygen forces the H–Br bond to break.',
            specificCases: [
              { answer: 1, message: 'One arrow makes the O–H bond, but then H would have 4 electrons. A second arrow must break H–Br.' },
            ],
          },
        },
      ],
    },
  ],
}
