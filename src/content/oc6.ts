import type { Lesson } from '../types/lesson'
import type { PathwayConsoleConfig } from '../types/orgo'

/** Step 1 — the live prediction console. No target: the learner explores freely. */
const console1: PathwayConsoleConfig = {
  caption: 'Dial the substrate, the reagent, and the heat — watch the predicted mechanism light up.',
}

/** Four-way choice reused by every "which mechanism?" gate. */
const MECH = [
  { id: 'sn1', label: 'SN1' },
  { id: 'sn2', label: 'SN2' },
  { id: 'e1', label: 'E1' },
  { id: 'e2', label: 'E2' },
]

export const oc6: Lesson = {
  id: 'oc-6',
  title: 'Choosing the Pathway',
  subject: 'Organic Chemistry · Mechanisms',
  order: 6,
  prerequisiteLessonId: 'oc-5',
  tagline: 'SN1, SN2, E1, or E2? Read the substrate, the reagent, and the heat — then call it.',
  completionMessage:
    'You can look at any substrate and reagent and predict the mechanism — the whole course in one decision.',
  steps: [
    {
      id: 'oc6-console',
      step: 1,
      type: 'orgo',
      prompt: 'Dial the conditions and watch the prediction move. Then call two new cases.',
      visual: { component: 'pathway-console', config: console1 },
      gateOnSolved: true,
      gateOnSolvedHint: 'Dial the conditions and watch the prediction, then answer.',
      gates: [
        {
          id: 'oc6-console-e2',
          label: 'Bulky base, hot',
          prompt: 'A 3° substrate + a strong bulky base (t-BuOK), with heat → which mechanism dominates?',
          options: MECH,
          correctId: 'e2',
          feedback: {
            wrong: 'A 3° carbon can’t do SN2, a strong base shuts down the carbocation routes, and heat favors elimination.',
            byOption: {
              sn1: 'SN1 needs a weak, neutral reagent — a strong base drives elimination instead.',
              sn2: 'A 3° carbon is far too hindered for backside attack (SN2).',
              e1: 'A strong base means bimolecular elimination (E2), not the stepwise E1 of a weak reagent.',
            },
          },
        },
        {
          id: 'oc6-console-sn2',
          label: 'Methyl + Nu',
          prompt: 'A methyl substrate + a strong nucleophile (CN⁻) → which mechanism?',
          options: MECH,
          correctId: 'sn2',
          feedback: {
            wrong: 'Methyl has no β-hydrogen (no elimination) and forms no carbocation (no SN1/E1). Only one path is left.',
            byOption: {
              sn1: 'A methyl cation is far too unstable to form — no SN1.',
              e1: 'Methyl has no β-hydrogen, so it can’t eliminate.',
              e2: 'Methyl has no β-hydrogen, so it can’t eliminate.',
            },
          },
        },
      ],
    },
    {
      id: 'oc6-predict',
      step: 2,
      type: 'orgo',
      prompt: 'No console this time — predict each one from the rules.',
      gates: [
        {
          id: 'oc6-predict-sn1',
          label: 'Warm water, 3°',
          prompt:
            'A 3° substrate in warm water (weak, neutral nucleophile, no strong base) → the substitution product forms by which mechanism?',
          options: MECH,
          correctId: 'sn1',
          feedback: {
            wrong: 'With only a weak, neutral reagent the substrate must ionize first; the nucleophile then captures the carbocation.',
            byOption: {
              sn2: 'SN2 needs a strong nucleophile and an open carbon — neither is true for a 3° substrate in water.',
              e1: 'E1 is the elimination product from that carbocation; the question asks for the substitution product.',
              e2: 'E2 needs a strong base, which warm water is not.',
            },
          },
        },
        {
          id: 'oc6-predict-sn2',
          label: '1° + I⁻',
          prompt: 'A 1° substrate + a strong unhindered nucleophile (I⁻) → which mechanism?',
          options: MECH,
          correctId: 'sn2',
          feedback: {
            wrong: 'A 1° carbon won’t form a cation (no SN1/E1), and I⁻ is a strong nucleophile but a weak base (no E2).',
            byOption: {
              sn1: 'Primary carbocations don’t form, so there’s no SN1.',
              e2: 'I⁻ is a weak base, so it substitutes rather than eliminates.',
            },
          },
        },
        {
          id: 'oc6-predict-e2',
          label: '2° + base',
          prompt: 'A 2° substrate + a strong base (HO⁻) → which mechanism dominates?',
          options: MECH,
          correctId: 'e2',
          feedback: {
            wrong: 'On a 2° carbon a strong base favors bimolecular elimination over substitution.',
            byOption: {
              sn1: 'SN1 needs a weak, neutral reagent — a strong base pushes elimination.',
              sn2: 'A strong base on a 2° carbon tips the balance to E2, not SN2.',
              e1: 'With a strong base present it’s concerted E2, not the stepwise E1.',
            },
          },
        },
      ],
    },
    {
      id: 'oc6-rule',
      step: 3,
      type: 'rule-statement',
      explanation:
        'Decide in three passes. First the substrate: a methyl or 1° carbon can only do SN2 (no cation forms) — unless you use a bulky base, which forces E2; a 3° carbon can’t do SN2 at all, so it runs SN1/E1 — unless a strong base is present, which makes it E2; a 2° carbon is the swing class and lets the reagent decide. Then the reagent: a strong, unhindered nucleophile that’s a weak base (I⁻, CN⁻) gives substitution (SN2); a strong base — especially a bulky one like t-BuOK — gives elimination (E2); a weak, neutral reagent (water, an alcohol) only reacts with substrates that ionize, giving SN1/E1. Finally, temperature: heat always favors elimination over substitution.',
      overlayExpression: 'substrate sets the stage · reagent picks S vs E · heat → elimination',
    },
    {
      id: 'oc6-teach',
      step: 4,
      type: 'teach-back',
      concept: 'choosing between SN1, SN2, E1, and E2',
      problem:
        '2-bromo-2-methylpropane (tert-butyl bromide, a 3° substrate) is treated with sodium ethoxide (NaOEt, a strong base). Predict the major product and the mechanism.',
      prompt: 'Teach me how to call this one: what does the substrate rule out, what does the reagent want, and which mechanism wins?',
      keyPoints: [
        'Start with the substrate: a 3° carbon is too hindered for SN2 — and conversely a 1° carbon won’t do SN1 or E1, because its carbocation won’t form',
        'A strong base — especially a bulky one — favors elimination by the E2 mechanism',
        'A strong nucleophile that is a weak base (e.g. I⁻, CN⁻) favors substitution by SN2 instead',
        'A weak or neutral reagent (water, an alcohol) on a 2° or 3° carbon gives the carbocation pathways, SN1 and E1',
        'Heat tips the balance toward elimination, so tert-butyl bromide + ethoxide gives the alkene via E2',
      ],
    },
    {
      id: 'oc6-cold',
      step: 5,
      type: 'cold-problem',
      problems: [
        {
          id: 'oc6-cold-bimolecular',
          prompt: 'Of SN1, SN2, E1, and E2, how many are bimolecular (the rate depends on two species)?',
          correctValue: 2,
          feedbackWrong: {
            default: 'Bimolecular means both the substrate and the nucleophile/base appear in the rate-determining step — that’s the two “2” mechanisms.',
            specificCases: [
              { answer: 4, message: 'SN1 and E1 are unimolecular — their rate depends only on the substrate ionizing.' },
              { answer: 1, message: 'There are two bimolecular mechanisms: SN2 and E2.' },
              { answer: 3, message: 'Only SN2 and E2 are bimolecular; SN1 and E1 are unimolecular.' },
            ],
          },
        },
        {
          id: 'oc6-cold-hindered',
          prompt: 'A 3° substrate is too hindered to carry out how many of the four mechanisms?',
          correctValue: 1,
          feedbackWrong: {
            default: 'Only one mechanism needs the nucleophile to attack the carbon directly through an open backside.',
            specificCases: [
              { answer: 0, message: 'SN2 requires backside attack, which a 3° carbon blocks — that’s the one it can’t do.' },
              { answer: 2, message: 'A 3° carbon happily does SN1, E1, and E2 — only SN2 is off the table.' },
              { answer: 3, message: 'A 3° carbon is great for SN1, E1, and E2; just SN2 is blocked.' },
            ],
          },
        },
      ],
    },
  ],
}
