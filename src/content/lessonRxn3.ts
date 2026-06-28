import type { Lesson } from '../types/lesson'

/**
 * Reaction Mechanisms · Lesson 3 — SN1: Carbocations & Racemization.
 * SN2's mirror image: the leaving group leaves first to make a flat carbocation,
 * which the nucleophile then attacks from either face (racemization). The rate
 * depends only on the substrate (first order) and on carbocation stability.
 */
export const lessonRxn3: Lesson = {
  id: 'rxn-3',
  title: 'SN1: Carbocations',
  subject: 'Organic Chemistry · Substitution & Elimination',
  order: 3,
  prerequisiteLessonId: 'rxn-2',
  tagline: 'Leave the carbon alone and it collapses flat — then anything can attack either side.',
  steps: [
    {
      id: 'rxn3-ionize',
      step: 1,
      type: 'mechanism',
      prompt: 'No nucleophile around. Knock the bromide off this tertiary carbon.',
      gateOnSolved: true,
      visual: {
        component: 'mechanism-canvas',
        config: {
          mode: 'ionize',
          caption: 'Push the C–Br bond onto Br.',
          hint: 'The bond electrons leave with bromine. Drag the C–Br bond out to Br.',
          atoms: [
            { id: 'c', label: 'C', x: 150, y: 125 },
            { id: 'br', label: 'Br', x: 245, y: 125, lonePairs: 3, role: 'leaving' },
            { id: 'g1', label: 'CH₃', x: 92, y: 88 },
            { id: 'g2', label: 'C₂H₅', x: 92, y: 162 },
            { id: 'g3', label: 'C₃H₇', x: 150, y: 58 },
          ],
          bonds: [
            { id: 'c-br', a: 'c', b: 'br', order: 1 },
            { id: 'c-g1', a: 'c', b: 'g1', order: 1 },
            { id: 'c-g2', a: 'c', b: 'g2', order: 1 },
            { id: 'c-g3', a: 'c', b: 'g3', order: 1 },
          ],
          tails: [{ id: 'cbr-bond', kind: 'bond', on: 'c-br', x: 197, y: 125 }],
          heads: [{ id: 'br-head', kind: 'atom', on: 'br', x: 245, y: 125 }],
          solution: [{ tail: 'cbr-bond', head: 'br-head' }],
        },
      },
      gates: [
        {
          id: 'rxn3-s1-shape',
          label: 'Carbocation shape',
          prompt: 'With bromine gone, what shape is the carbon left behind?',
          options: [
            { id: 'planar', label: 'Trigonal planar' },
            { id: 'tet', label: 'Tetrahedral' },
            { id: 'linear', label: 'Linear' },
          ],
          correctId: 'planar',
          feedback: {
            wrong: 'Only three groups remain on the carbon, and they spread as far apart as possible — into a flat plane.',
          },
        },
        {
          id: 'rxn3-s1-angle',
          label: 'Bond angle',
          prompt: 'What is the bond angle around that flat carbon, in degrees?',
          correctValue: 120,
          hintText: 'Three groups, evenly spread in a plane — 360 ÷ 3.',
          feedbackWrong: {
            default: 'Three groups sharing a flat plane sit 120° apart.',
            specificCases: [{ answer: 109, message: "That's the tetrahedral angle — but a group just left, so it's flat now." }],
          },
        },
      ],
    },
    {
      id: 'rxn3-attack',
      step: 2,
      type: 'mechanism',
      prompt: 'Now let hydroxide in. The carbon is flat — attack a face.',
      gateOnSolved: true,
      visual: {
        component: 'mechanism-canvas',
        config: {
          mode: 'attack',
          caption: 'Top face or bottom face — both work.',
          hint: 'A lone pair on O attacks the empty p orbital. Either face of the flat carbon is fair game.',
          atoms: [
            { id: 'c', label: 'C', x: 170, y: 125, charge: 1 },
            { id: 'o', label: 'O', x: 58, y: 125, charge: -1, lonePairs: 3, role: 'nucleophile' },
            { id: 'g1', label: 'CH₃', x: 118, y: 92 },
            { id: 'g2', label: 'C₂H₅', x: 118, y: 158 },
            { id: 'g3', label: 'C₃H₇', x: 215, y: 92 },
          ],
          bonds: [
            { id: 'c-g1', a: 'c', b: 'g1', order: 1 },
            { id: 'c-g2', a: 'c', b: 'g2', order: 1 },
            { id: 'c-g3', a: 'c', b: 'g3', order: 1 },
          ],
          tails: [{ id: 'o-lp', kind: 'lone-pair', on: 'o', x: 58, y: 97 }],
          heads: [
            { id: 'c-top', kind: 'empty-orbital', on: 'c', x: 170, y: 92 },
            { id: 'c-bottom', kind: 'empty-orbital', on: 'c', x: 170, y: 160 },
          ],
          equivalentHeads: { 'c-bottom': 'c-top' },
          solution: [{ tail: 'o-lp', head: 'c-top' }],
          formBonds: [{ id: 'c-o', a: 'c', b: 'o', order: 1 }],
          chargeAfter: { c: 0, o: 0 },
        },
      },
      gates: [
        {
          id: 'rxn3-s2-faces',
          label: 'Faces',
          prompt: 'Attack on each face gives a different enantiomer — how many products?',
          correctValue: 2,
          hintText: 'Top attack gives one mirror image; bottom attack gives the other.',
          feedbackWrong: {
            default: 'The flat carbon can be hit from two faces, giving two mirror-image products.',
            specificCases: [{ answer: 1, message: 'SN2 gave one product because attack was backside-only. A flat carbocation has two open faces.' }],
          },
        },
        {
          id: 'rxn3-s2-mix',
          label: 'Product',
          prompt: 'So a single starting material gives…',
          options: [
            { id: 'one', label: 'One pure product' },
            { id: 'racemic', label: 'A ~50:50 mix of both mirror images' },
          ],
          correctId: 'racemic',
          feedback: {
            wrong: 'Both faces are equally open, so you get roughly equal amounts of each enantiomer — a racemic mix.',
          },
        },
      ],
    },
    {
      id: 'rxn3-rate',
      step: 3,
      type: 'mechanism',
      prompt: 'What sets the SN1 rate? Drag toward 3°, then crank the nucleophile.',
      gateOnSolved: true,
      visual: {
        component: 'rate-lab',
        config: {
          caption: 'Stability climbs methyl → 3°. Now add more nucleophile and watch the rate.',
          sliders: ['substrate', 'nucleophile'],
          substrates: [
            { id: 'me', label: 'methyl', degree: 'methyl', relRate: 1 },
            { id: 'p1', label: 'ethyl', degree: '1°', relRate: 6 },
            { id: 'p2', label: 'isopropyl', degree: '2°', relRate: 35 },
            { id: 'p3', label: 'tert-butyl', degree: '3°', relRate: 100 },
          ],
        },
      },
      gates: [
        {
          id: 'rxn3-s3-fast',
          label: 'Fastest',
          prompt: 'Which substrate ionizes fastest in SN1?',
          options: [
            { id: 'me', label: 'Methyl' },
            { id: 'p1', label: '1° (primary)' },
            { id: 'p3', label: '3° (tertiary)' },
          ],
          correctId: 'p3',
          feedback: {
            wrong: 'The more stable the carbocation, the easier it forms — and stability climbs 3° > 2° > 1° > methyl.',
          },
        },
        {
          id: 'rxn3-s3-order',
          label: 'Effect of nucleophile',
          prompt: 'Doubling the nucleophile concentration multiplies the rate by ___',
          correctValue: 1,
          hintText: 'The slow step (ionization) happens before the nucleophile shows up.',
          feedbackWrong: {
            default: 'The nucleophile only attacks AFTER the slow step, so it never enters the rate law — the rate is unchanged.',
            specificCases: [{ answer: 2, message: "That's SN2 thinking. In SN1 the slow step is ionization, with no nucleophile — so more nucleophile changes nothing." }],
          },
        },
      ],
    },
    {
      id: 'rxn3-rule',
      step: 4,
      type: 'rule-statement',
      explanation:
        'SN1 is the mirror image of SN2. Step 1 (slow, rate-determining): the leaving group departs on its own, giving a flat carbocation — so rate = k[substrate] (first order, independent of the nucleophile), and it speeds up with carbocation stability (3° > 2° > 1° > methyl). Step 2 (fast): the nucleophile attacks the flat carbon from either face, so a single stereocenter racemizes to a ~50:50 mix. Favored by stable (3°) carbocations, weak/neutral nucleophiles, polar protic solvents, and good leaving groups.',
      overlayExpression: 'leave first → flat carbocation → attack either face (racemic)',
    },
    {
      id: 'rxn3-teach',
      step: 5,
      type: 'teach-back',
      concept: 'why a chiral 3° substrate racemizes in SN1, and why adding nucleophile does not speed it up',
      problem:
        '(R)-3-bromo-3-methylhexane is stirred in aqueous ethanol. Predict the product stereochemistry and the effect of doubling the water concentration.',
      prompt: "Teach me the mechanism — what happens first, what the carbocation looks like, and what the product is.",
      keyPoints: [
        'The leaving group departs first (slow step) to give a flat, sp² carbocation',
        'The flat carbocation is achiral, so the nucleophile attacks both faces equally → a ~50:50 racemic mix',
        'Rate = k[substrate]: the nucleophile is not in the slow step, so doubling [water] does not change the rate',
      ],
    },
    {
      id: 'rxn3-cold',
      step: 6,
      type: 'cold-problem',
      problems: [
        {
          id: 'rxn3-cold-a',
          prompt:
            'A single enantiomer of a 3° bromide fully reacts by SN1. Enter 1 if the product is optically active, or 2 if it is a racemic mix with zero net rotation.',
          correctValue: 2,
          feedbackWrong: {
            default: 'The flat carbocation is attacked equally on both faces, so equal R and S form — their rotations cancel.',
            specificCases: [{ answer: 1, message: 'Both faces are open and equally likely, so you get a 50:50 mix whose rotations cancel to zero.' }],
          },
        },
        {
          id: 'rxn3-cold-b',
          prompt: 'In an SN1 reaction you double the nucleophile concentration. The rate multiplies by ___.',
          correctValue: 1,
          feedbackWrong: {
            default: 'SN1 is first order in substrate only — the nucleophile attacks after the slow step.',
            specificCases: [{ answer: 2, message: "That's SN2. SN1's slow step is ionization, with no nucleophile involved." }],
          },
        },
      ],
    },
  ],
}
