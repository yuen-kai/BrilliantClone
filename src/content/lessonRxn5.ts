import type { Lesson } from '../types/lesson'

/**
 * Reaction Mechanisms · Lesson 5 — E1: Carbocation Elimination.
 * E1 shares SN1's first step: the leaving group leaves to make a carbocation,
 * then a weak base removes a β-hydrogen to form the alkene. SN1 and E1 compete
 * off the same carbocation; heat and Zaitsev govern the elimination.
 */
export const lessonRxn5: Lesson = {
  id: 'rxn-5',
  title: 'E1: Carbocation Route',
  subject: 'Organic Chemistry · Substitution & Elimination',
  order: 5,
  prerequisiteLessonId: 'rxn-4',
  tagline: 'E1 is SN1 until the second arrow — one carbocation, two possible fates.',
  steps: [
    {
      id: 'rxn5-ionize',
      step: 1,
      type: 'mechanism',
      prompt: 'Knock the leaving group off. Where have you seen this exact first step?',
      gateOnSolved: true,
      visual: {
        component: 'mechanism-canvas',
        config: {
          mode: 'ionize',
          caption: 'Push the C–Br bond onto Br.',
          hint: 'The bond electrons leave with bromine — the same slow first step as SN1.',
          atoms: [
            { id: 'c', label: 'C', x: 150, y: 125 },
            { id: 'br', label: 'Br', x: 245, y: 125, lonePairs: 3, role: 'leaving' },
            { id: 'g1', label: 'CH₃', x: 92, y: 88 },
            { id: 'g2', label: 'CH₂CH₃', x: 92, y: 168 },
            { id: 'g3', label: 'CH₃', x: 150, y: 58 },
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
          id: 'rxn5-s1-which',
          label: 'Shared step',
          prompt: 'Which reaction began with this exact step (leaving group leaves → carbocation)?',
          options: [
            { id: 'sn1', label: 'SN1' },
            { id: 'sn2', label: 'SN2' },
            { id: 'e2', label: 'E2' },
          ],
          correctId: 'sn1',
          feedback: {
            wrong: 'SN2 and E2 are concerted (no carbocation). The lone two-step starter that makes a carbocation first is SN1 — and E1 shares it.',
          },
        },
      ],
    },
    {
      id: 'rxn5-eliminate',
      step: 2,
      type: 'mechanism',
      prompt: 'A weak base is nearby — let it take a β-hydrogen next to the carbocation.',
      gateOnSolved: true,
      visual: {
        component: 'mechanism-canvas',
        config: {
          mode: 'fork',
          caption: 'Two arrows: base grabs a β-H, and the C–H electrons form the C=C.',
          hint: 'Drag the base lone pair to the β-hydrogen, and drag the β C–H bond into the gap between the carbons.',
          atoms: [
            { id: 'ca', label: 'C', x: 165, y: 132, charge: 1 },
            { id: 'cb', label: 'CH₂', x: 102, y: 132 },
            { id: 'hb', label: 'H', x: 102, y: 78 },
            { id: 'g', label: 'CH₃', x: 218, y: 132 },
            { id: 'base', label: 'EtOH', x: 52, y: 70, lonePairs: 2, role: 'base' },
          ],
          bonds: [
            { id: 'ca-cb', a: 'ca', b: 'cb', order: 1 },
            { id: 'cb-hb', a: 'cb', b: 'hb', order: 1 },
            { id: 'ca-g', a: 'ca', b: 'g', order: 1 },
          ],
          tails: [
            { id: 'base-lp', kind: 'lone-pair', on: 'base', x: 52, y: 70 },
            { id: 'cbh-bond', kind: 'bond', on: 'cb-hb', x: 102, y: 105 },
          ],
          heads: [
            { id: 'hb-head', kind: 'atom', on: 'hb', x: 102, y: 78 },
            { id: 'pi', kind: 'bond', on: 'ca-cb', x: 133, y: 132 },
          ],
          solution: [
            { tail: 'base-lp', head: 'hb-head' },
            { tail: 'cbh-bond', head: 'pi' },
          ],
        },
      },
      gates: [
        {
          id: 'rxn5-s2-gives',
          label: 'Product',
          prompt: 'What kind of product does this step make?',
          options: [
            { id: 'alkene', label: 'Alkene (elimination)' },
            { id: 'sub', label: 'Substitution product' },
            { id: 'nothing', label: 'Nothing — it stops' },
          ],
          correctId: 'alkene',
          feedback: { wrong: 'A new C=C double bond between the carbons is an alkene — this is elimination.' },
        },
        {
          id: 'rxn5-s2-shared',
          label: 'Shared intermediate',
          prompt: 'SN1 (attack the carbon) and E1 (take a β-H) both branch from the same…',
          options: [
            { id: 'cation', label: 'Carbocation' },
            { id: 'lg', label: 'Leaving group' },
            { id: 'base', label: 'Base' },
          ],
          correctId: 'cation',
          feedback: { wrong: 'Once the leaving group is gone, the carbocation can either be attacked (SN1) or lose a β-H (E1).' },
        },
      ],
    },
    {
      id: 'rxn5-zaitsev',
      step: 3,
      type: 'mechanism',
      prompt: 'This carbocation has β-hydrogens on two sides — one side has more carbons. Make the more stable alkene.',
      gateOnSolved: true,
      visual: {
        component: 'mechanism-canvas',
        config: {
          mode: 'fork',
          caption: 'Pull the β-H from the side with more carbons.',
          hint: 'More carbons on the C=C → a more stable alkene. Take the H from the longer-chain side.',
          atoms: [
            { id: 'ca', label: 'C', x: 160, y: 138, charge: 1 },
            { id: 'cb1', label: 'CH', x: 100, y: 138 },
            { id: 'me', label: 'CH₂CH₃', x: 48, y: 138 },
            { id: 'hint', label: 'H', x: 100, y: 86 },
            { id: 'cb2', label: 'CH₃', x: 222, y: 138 },
            { id: 'hterm', label: 'H', x: 222, y: 86 },
            { id: 'base', label: 'EtOH', x: 160, y: 48, lonePairs: 2, role: 'base' },
          ],
          bonds: [
            { id: 'ca-cb1', a: 'ca', b: 'cb1', order: 1 },
            { id: 'cb1-me', a: 'cb1', b: 'me', order: 1 },
            { id: 'cb1-hint', a: 'cb1', b: 'hint', order: 1 },
            { id: 'ca-cb2', a: 'ca', b: 'cb2', order: 1 },
            { id: 'cb2-hterm', a: 'cb2', b: 'hterm', order: 1 },
          ],
          tails: [
            { id: 'base-lp', kind: 'lone-pair', on: 'base', x: 160, y: 48 },
            { id: 'chb-int', kind: 'bond', on: 'cb1-hint', x: 100, y: 112 },
            { id: 'chb-term', kind: 'bond', on: 'cb2-hterm', x: 222, y: 112 },
          ],
          heads: [
            { id: 'h-int', kind: 'atom', on: 'hint', x: 100, y: 86 },
            { id: 'pi-int', kind: 'bond', on: 'ca-cb1', x: 130, y: 138 },
            { id: 'h-term', kind: 'atom', on: 'hterm', x: 222, y: 86 },
            { id: 'pi-term', kind: 'bond', on: 'ca-cb2', x: 191, y: 138 },
          ],
          solution: [
            { tail: 'base-lp', head: 'h-int' },
            { tail: 'chb-int', head: 'pi-int' },
          ],
        },
      },
      gates: [
        {
          id: 'rxn5-s3-zaitsev',
          label: 'Major product',
          prompt: 'Which alkene is major here?',
          options: [
            { id: 'more', label: 'More substituted' },
            { id: 'less', label: 'Less substituted' },
          ],
          correctId: 'more',
          feedback: { wrong: 'More alkyl groups on the C=C make it more stable, so the more-substituted alkene is major.' },
        },
      ],
    },
    {
      id: 'rxn5-rule',
      step: 4,
      type: 'rule-statement',
      explanation:
        'E1 is a two-step elimination that shares SN1’s first step. Step 1 (slow, rate-determining): the leaving group departs, giving a carbocation — so rate = k[substrate] (first order, independent of the base). Step 2 (fast): a weak base removes a β-hydrogen and those electrons form the C=C π bond. Because the carbocation is the same intermediate SN1 forms, the two compete: attacking the carbon gives substitution (SN1), losing a β-H gives elimination (E1). Stable (3°) carbocations, weak bases, polar protic solvents, and heat all favor E1, and the more-substituted (Zaitsev) alkene is major.',
      overlayExpression: 'leave first → carbocation → lose a β-H (Zaitsev, heat favors it)',
    },
    {
      id: 'rxn5-teach',
      step: 5,
      type: 'teach-back',
      concept: 'why E1 and SN1 compete, and what tips the balance toward elimination',
      problem:
        '2-bromo-2-methylbutane is heated in ethanol. Predict the major product and explain why a little substitution product tags along.',
      prompt: "Teach me the two steps, why both an alkene and a substitution product appear, and what heat does.",
      keyPoints: [
        'The leaving group departs first (slow, rate-determining), giving a carbocation — the same step as SN1',
        'A weak base then removes a β-hydrogen to form the more-substituted (Zaitsev) alkene',
        'SN1 competes because the nucleophile can attack the same carbocation; heat favors elimination (E1)',
      ],
    },
    {
      id: 'rxn5-cold',
      step: 6,
      type: 'cold-problem',
      problems: [
        {
          id: 'rxn5-cold-a',
          prompt:
            'Same hot 3° substrate, but swap the weak base for a strong, bulky one. Enter the favored pathway as 1=SN1, 2=SN2, 3=E1, 4=E2.',
          correctValue: 4,
          feedbackWrong: {
            default: 'A strong base does not wait for a carbocation to form — it removes a β-H in one concerted step (E2).',
            specificCases: [
              { answer: 3, message: 'E1 needs a weak base. A strong base reacts in one concerted step before a carbocation forms — that is E2.' },
              { answer: 2, message: 'SN2 can’t attack a crowded 3° carbon. A strong base eliminates instead.' },
            ],
          },
        },
        {
          id: 'rxn5-cold-b',
          prompt: 'Doubling the base concentration multiplies the E1 rate by ___.',
          correctValue: 1,
          feedbackWrong: {
            default: 'E1 is first order in substrate only — the base acts after the slow ionization step.',
            specificCases: [{ answer: 2, message: 'That would be E2 (bimolecular). E1’s slow step is ionization, with no base involved.' }],
          },
        },
      ],
    },
  ],
}
