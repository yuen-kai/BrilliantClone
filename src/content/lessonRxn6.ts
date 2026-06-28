import type { Lesson } from '../types/lesson'

/**
 * Reaction Mechanisms · Lesson 6 (capstone) — Choosing the Pathway: SN1/SN2/E1/E2.
 * The whole course converges here: the learner dials a "reaction console" one
 * factor at a time — substrate class, then the reagent, then solvent + heat —
 * and learns the decision order that picks the winning mechanism. The console
 * never shows the verdict; every "which mechanism?" is gated.
 */
export const lessonRxn6: Lesson = {
  id: 'rxn-6',
  title: 'Choosing the Pathway: SN1/SN2/E1/E2',
  subject: 'Organic Chemistry · Substitution & Elimination',
  order: 6,
  prerequisiteLessonId: 'rxn-5',
  tagline:
    'Same leaving group, four possible fates. Read the conditions — substrate, reagent, solvent, heat — and call the mechanism before it runs.',
  steps: [
    {
      id: 'rxn6-step1',
      step: 1,
      type: 'mechanism',
      prompt:
        'Start with the substrate alone. Spin the dial to a primary (1°) carbon and notice what it can — and can’t — do.',
      gateOnSolved: true,
      visual: {
        component: 'reaction-console',
        config: {
          substrate: { klass: '1°', label: 'bromoethane (1°)' },
          controls: ['substrate'],
          caption: 'Spin the dial to set the substrate class.',
        },
      },
      gates: [
        {
          id: 'rxn6-s1-impossible',
          label: 'Impossible pair',
          prompt: 'On a 1° substrate, which pair of mechanisms is impossible?',
          options: [
            { id: 'sn1e1', label: 'SN1 & E1' },
            { id: 'sn2e2', label: 'SN2 & E2' },
            { id: 'sn1sn2', label: 'SN1 & SN2' },
          ],
          correctId: 'sn1e1',
          feedback: {
            wrong:
              'SN1 and E1 both go through a carbocation, and a 1° carbocation is far too unstable to form.',
            byOption: {
              sn2e2:
                'SN2 and E2 are exactly what an unhindered 1° carbon does — they’re concerted and never need a carbocation.',
              sn1sn2: 'SN2 is fine on a 1° carbon — it’s the carbocation (SN1) route that’s blocked.',
            },
          },
        },
        {
          id: 'rxn6-s1-must',
          label: 'So it reacts by',
          prompt: 'With both carbocation routes ruled out, a 1° substrate must react by…?',
          options: [
            { id: 'sn2e2', label: 'SN2 or E2' },
            { id: 'sn1e1', label: 'SN1 or E1' },
            { id: 'sn1e2', label: 'SN1 or E2' },
          ],
          correctId: 'sn2e2',
          feedback: {
            wrong: 'Only the concerted routes are left — the ones that never make a carbocation.',
            byOption: {
              sn1e1: 'Those are the carbocation routes you just ruled out for a 1° carbon.',
              sn1e2: 'Half right — E2 is possible, but SN1 (a carbocation) is not. Both survivors are concerted.',
            },
          },
        },
      ],
    },
    {
      id: 'rxn6-step2',
      step: 2,
      type: 'mechanism',
      prompt:
        'Lock the substrate at secondary (2°) — the swing class. Now the reagent makes the call: drop one into the flask and choose a solvent.',
      gateOnSolved: true,
      visual: {
        component: 'reaction-console',
        config: {
          substrate: { klass: '2°', label: '2-bromopropane (2°)' },
          controls: ['reagent', 'solvent'],
          reagents: [
            { id: 'cn', label: 'NaCN', role: 'strong-nu' },
            { id: 'sh', label: 'NaSH', role: 'strong-nu' },
            { id: 'otbu', label: 'KOtBu', role: 'strong-bulky-base' },
            { id: 'oet', label: 'NaOEt', role: 'strong-small-base' },
            { id: 'h2o', label: 'H₂O', role: 'weak-neutral' },
          ],
          caption: 'Drop a reagent into the flask, then set the solvent.',
        },
      },
      gates: [
        {
          id: 'rxn6-s2-sn2',
          label: 'Strong Nu · aprotic',
          prompt:
            'A strong, small nucleophile (CN⁻) in acetone (polar aprotic) on the 2° carbon — which mechanism wins?',
          options: [
            { id: 'sn2', label: 'SN2' },
            { id: 'sn1', label: 'SN1' },
            { id: 'e1', label: 'E1' },
            { id: 'e2', label: 'E2' },
          ],
          correctId: 'sn2',
          feedback: {
            wrong:
              'A strong nucleophile in an aprotic solvent attacks the carbon directly — one concerted, backside step.',
            byOption: {
              e2: 'E2 needs a strong BASE pulling a β-hydrogen. CN⁻ is a superb nucleophile but a weak base, so it substitutes.',
              sn1: 'SN1 needs a weak nucleophile and a protic solvent to ionize first. A strong Nu in aprotic doesn’t wait.',
              e1: 'E1 needs a carbocation. A strong nucleophile in aprotic solvent attacks before one can form.',
            },
          },
        },
        {
          id: 'rxn6-s2-e2',
          label: 'Strong base + heat',
          prompt:
            'Swap in a strong base (KOtBu) and add heat on that same 2° carbon — which mechanism wins?',
          options: [
            { id: 'e2', label: 'E2' },
            { id: 'sn2', label: 'SN2' },
            { id: 'sn1', label: 'SN1' },
            { id: 'e1', label: 'E1' },
          ],
          correctId: 'e2',
          feedback: {
            wrong:
              'A strong base + heat strips a β-hydrogen as the leaving group departs — a single concerted elimination.',
            byOption: {
              sn2: 'A strong, bulky base is too hindered to attack carbon; it grabs an accessible β-H instead, and heat favors elimination.',
              e1: 'E1 needs a weak base and a carbocation. A STRONG base drives the concerted, one-step E2.',
              sn1: 'SN1 is substitution via a carbocation — but a strong base + heat means elimination, not substitution.',
            },
          },
        },
      ],
    },
    {
      id: 'rxn6-step3',
      step: 3,
      type: 'mechanism',
      prompt:
        'Now a tertiary (3°) carbon with a weak nucleophile: SN2 is impossible, so it ionizes. Set the solvent and the temperature to decide its fate.',
      gateOnSolved: true,
      visual: {
        component: 'reaction-console',
        config: {
          substrate: { klass: '3°', label: '2-bromo-2-methylpropane (3°)' },
          controls: ['solvent', 'heat'],
          caption: 'Set the solvent and throw the temperature lever.',
        },
      },
      gates: [
        {
          id: 'rxn6-s3-sn1',
          label: 'Cool · polar protic',
          prompt:
            'Weak nucleophile, polar protic solvent, kept cool — on the 3° carbon, which mechanism wins?',
          options: [
            { id: 'sn1', label: 'SN1' },
            { id: 'sn2', label: 'SN2' },
            { id: 'e1', label: 'E1' },
            { id: 'e2', label: 'E2' },
          ],
          correctId: 'sn1',
          feedback: {
            wrong:
              'A protic solvent stabilizes the carbocation, and with no strong base and low heat, the weak nucleophile simply captures it.',
            byOption: {
              sn2: 'SN2 can’t happen on a 3° carbon — there’s no room for backside attack.',
              e1: 'E1 competes only once you add heat. Cool conditions favor capture (substitution).',
              e2: 'E2 needs a strong base. With only a weak nucleophile here, elimination would be the stepwise E1, not E2.',
            },
          },
        },
        {
          id: 'rxn6-s3-e1',
          label: 'Add heat',
          prompt: 'Same 3° carbocation, but now crank the heat — elimination grows. Which mechanism?',
          options: [
            { id: 'e1', label: 'E1' },
            { id: 'e2', label: 'E2' },
            { id: 'sn1', label: 'SN1' },
            { id: 'sn2', label: 'SN2' },
          ],
          correctId: 'e1',
          feedback: {
            wrong:
              'Heat favors elimination, and with only a weak base around, the carbocation loses a β-hydrogen on its own — a stepwise E1.',
            byOption: {
              e2: 'E2 needs a STRONG base ripping off the β-H in one concerted step. Here the base is weak, so it’s stepwise — E1.',
              sn1: 'Substitution and elimination share the same carbocation, but heat tips the balance toward elimination.',
              sn2: 'SN2 is off the table on a 3° carbon no matter the temperature.',
            },
          },
        },
        {
          id: 'rxn6-s3-steps',
          label: 'Steps to ionize',
          prompt: 'SN1 and E1 share a first move. How many distinct steps do they take — ionize, then react?',
          correctValue: 2,
          hintText: 'First the leaving group departs (slow), then the nucleophile captures or a β-H is lost (fast).',
          feedbackWrong: {
            default: 'Both SN1 and E1 are two-step: ionization to the carbocation, then capture or proton loss.',
            specificCases: [
              { answer: 1, message: 'One concerted step is the SN2/E2 story. SN1/E1 split into two: ionize, then react.' },
              { answer: 3, message: 'It’s just two: form the carbocation, then either capture the nucleophile or lose a β-H.' },
            ],
          },
        },
      ],
    },
    {
      id: 'rxn6-rule',
      step: 4,
      type: 'rule-statement',
      explanation:
        'Read the conditions in order. (1) Substrate first: methyl/1° can’t make a carbocation, so they go SN2 — or E2 if a strong, bulky base is forced on them; 3° can’t do SN2 (no room for backside attack), so it goes SN1/E1 — or E2 with a strong base; 2° is the swing class, decided by what you add. (2) Then the nucleophile/base: a strong, small, weakly basic nucleophile favors substitution (SN2 on an unhindered carbon); a strong, bulky base favors elimination (E2); a weak, neutral species means a carbocation route (SN1/E1). (3) Finally solvent and heat fine-tune it: polar aprotic frees the nucleophile and favors SN2, polar protic stabilizes ions and favors SN1/E1, and heat always favors elimination.',
      overlayExpression:
        'substrate → reagent → solvent/heat   ·   3° ✗ SN2 · 1° ✗ SN1/E1 · aprotic → SN2 · protic → SN1/E1 · Δ → elimination · bulky base → E2',
    },
    {
      id: 'rxn6-teach',
      step: 5,
      type: 'teach-back',
      concept: 'how to choose the pathway among SN1, SN2, E1, and E2',
      problem: '2-bromobutane + NaSH in acetone — predict the mechanism and the product.',
      prompt:
        'You’re the chemist — walk me through how you’d call this one, factor by factor. I’ll nudge you if something slips.',
      keyPoints: [
        '2-bromobutane is a 2° substrate, so every pathway is on the table — the reagent and solvent break the tie.',
        'NaSH delivers HS⁻: a strong, polarizable nucleophile but only a weak base, so it favors substitution over elimination.',
        'Acetone is polar aprotic, which leaves HS⁻ "naked" and reactive — ideal for a concerted backside attack.',
        'The verdict is SN2: HS⁻ displaces Br⁻ with inversion to give 2-butanethiol.',
      ],
    },
    {
      id: 'rxn6-cold',
      step: 6,
      type: 'cold-problem',
      problems: [
        {
          id: 'rxn6-cold-a',
          prompt:
            '2-chloro-2-methylpropane (3°) + KOtBu (a strong, bulky base), heated. Enter the mechanism — 1=SN1, 2=SN2, 3=E1, 4=E2.',
          correctValue: 4,
          feedbackWrong: {
            default: 'A strong, bulky base on a 3° carbon with heat is the textbook E2 (enter 4).',
            specificCases: [
              {
                answer: 2,
                message:
                  'SN2 can’t touch a 3° carbon — far too crowded for backside attack. A strong, bulky base eliminates instead → E2 (4).',
              },
              {
                answer: 1,
                message: 'SN1 needs a weak nucleophile. KOtBu is a strong base that rips off a β-H, and heat favors elimination → E2 (4).',
              },
              {
                answer: 3,
                message: 'E1 needs a weak base and a carbocation. A STRONG base drives the concerted, one-step E2 (4).',
              },
            ],
          },
        },
        {
          id: 'rxn6-cold-b',
          prompt:
            '1-bromobutane (1°) + NaCN in DMSO (polar aprotic). Enter the mechanism — 1=SN1, 2=SN2, 3=E1, 4=E2.',
          correctValue: 2,
          feedbackWrong: {
            default:
              'A strong nucleophile on an unhindered 1° carbon in a polar aprotic solvent is a clean SN2 (enter 2).',
            specificCases: [
              { answer: 1, message: 'SN1 needs a carbocation — impossible on a 1° carbon. The strong Nu attacks directly → SN2 (2).' },
              { answer: 3, message: 'E1 needs a carbocation, which a 1° carbon can’t form → SN2 (2).' },
              {
                answer: 4,
                message:
                  'CN⁻ is a strong nucleophile but a weak base, and the carbon is unhindered, so it substitutes, not eliminates → SN2 (2).',
              },
            ],
          },
        },
      ],
    },
  ],
}
