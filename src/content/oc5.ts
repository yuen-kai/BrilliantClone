import type { Lesson } from '../types/lesson'
import type { E1RouteConfig } from '../types/orgo'

/** A 3° substrate (a stable cation) so E1 is favoured. Two distinct β-carbons:
 * a terminal CH₂ → the less-substituted alkene, and an internal CH → the more-
 * substituted (Zaitsev) alkene. Br leaves first; water is the weak base. */
const e1Scene: E1RouteConfig = {
  leavingGroup: 'Br',
  base: 'H₂O',
  betaOptions: [
    { id: 'a', label: 'CH₂ (terminal)', substitution: 2 },
    { id: 'b', label: 'CH (internal)', substitution: 3, zaitsev: true },
  ],
  caption: 'Drag the leaving group off — let the carbon ionize on its own.',
}

export const oc5: Lesson = {
  id: 'oc-5',
  title: 'E1: Carbocation Elimination',
  subject: 'Organic Chemistry · Mechanisms',
  order: 5,
  prerequisiteLessonId: 'oc-4',
  tagline: 'Same cation as SN1 — but this time a β-hydrogen leaves and a double bond snaps into place.',
  completionMessage: 'You can run an E1: ionize to a carbocation, then lose a β-hydrogen for the more stable (Zaitsev) alkene.',
  steps: [
    {
      id: 'oc5-ionize',
      step: 1,
      type: 'orgo',
      prompt: 'Leave it be — let the leaving group go, then take a β-hydrogen.',
      visual: { component: 'e1-route', config: e1Scene },
      gateOnSolved: true,
      gateOnSolvedHint: 'Ionize to the cation, then pluck a β-hydrogen to form an alkene, then answer below.',
      gates: [
        {
          id: 'oc5-ionize-slow',
          label: 'Slow step',
          prompt: 'What is the slow, first step of E1?',
          options: [
            { id: 'lg', label: 'The leaving group leaves, forming a carbocation' },
            { id: 'beta', label: 'A base removes a β-hydrogen' },
            { id: 'both', label: 'Both happen at once' },
          ],
          correctId: 'lg',
          feedback: {
            wrong: 'You watched the bromide depart on its own before anything else could happen.',
            byOption: {
              beta: 'That is the fast second step — it can only happen once the cation already exists.',
              both: 'That would be a concerted, one-step reaction (E2). E1 builds an intermediate first.',
            },
          },
        },
        {
          id: 'oc5-ionize-order',
          label: 'Base order',
          prompt: 'E1 rate = k[substrate]. What is the reaction order with respect to the base?',
          correctValue: 0,
          feedbackWrong: {
            default: 'The base joins only after the slow step, so it is absent from the rate law.',
            specificCases: [
              { answer: 1, message: 'First order would put [base] in the rate law — but only [substrate] appears. It is order 0.' },
              { answer: 2, message: 'The base is not in the rate-determining step at all, so its order is 0, not 2.' },
            ],
          },
          revealExpression: 'order 0',
        },
      ],
    },
    {
      id: 'oc5-beta',
      step: 2,
      type: 'orgo',
      prompt: 'One cation, two β-hydrogens — form each alkene and compare.',
      visual: { component: 'e1-route', config: e1Scene },
      gateOnSolved: true,
      gateOnSolvedHint: 'Take a β-hydrogen to form an alkene, then answer below.',
      gates: [
        {
          id: 'oc5-beta-major',
          label: 'Major product',
          prompt: 'Two β-hydrogens give two different alkenes. Which is the major product?',
          options: [
            { id: 'more', label: 'The more substituted alkene (more stable)' },
            { id: 'less', label: 'The less substituted alkene' },
            { id: 'mix', label: 'A 50:50 mix of both' },
          ],
          correctId: 'more',
          feedback: {
            wrong: 'Compare the two stability bars — the taller one wins.',
            byOption: {
              less: 'That alkene is lower on the stability bar; the more substituted one is favoured.',
              mix: 'The two alkenes differ in stability, so they do not form in equal amounts.',
            },
          },
        },
        {
          id: 'oc5-beta-rule',
          label: 'The rule',
          prompt: 'What is this preference called?',
          options: [
            { id: 'zaitsev', label: "Zaitsev's rule" },
            { id: 'markovnikov', label: "Markovnikov's rule" },
            { id: 'hund', label: "Hund's rule" },
          ],
          correctId: 'zaitsev',
          feedback: {
            wrong: 'This is the elimination rule that favours the more substituted alkene.',
            byOption: {
              markovnikov: 'Markovnikov governs where H and X add across a double bond, not which alkene forms in elimination.',
              hund: 'Hund’s rule is about filling orbitals with electrons — unrelated to elimination products.',
            },
          },
        },
      ],
    },
    {
      id: 'oc5-rule',
      step: 3,
      type: 'rule-statement',
      explanation:
        'E1 is two steps, and the first one is exactly SN1’s: the leaving group departs on its own to give a carbocation. That slow, rate-determining step is unimolecular, so rate = k[substrate] only — the base does not appear in the rate law (order 0 in base). In the fast second step a weak base plucks a β-hydrogen (an H on a carbon next to the cation) and those electrons become a new C=C π bond — an alkene. When two different β-carbons are available, each gives a different alkene; the more substituted one is more stable, so by Zaitsev’s rule it is the major product. Because E1 and SN1 share that first carbocation, they compete: take a β-H and you eliminate, attack the cation and you substitute.',
      overlayExpression: 'rate = k [substrate]   ·   cation → lose β-H → more-substituted (Zaitsev) alkene',
    },
    {
      id: 'oc5-teach',
      step: 4,
      type: 'teach-back',
      concept: 'the E1 mechanism',
      problem:
        '2-bromo-2-methylbutane is heated in an ethanol/water mix and gives an alkene. Walk through what leaves first, what intermediate forms, why the rate ignores the base, and which alkene dominates.',
      prompt: 'Teach me E1 on this one. What happens first, what does the base do, and which alkene wins?',
      keyPoints: [
        'E1 happens in two steps, not one concerted push',
        'The slow, rate-determining first step is the leaving group leaving to form a carbocation',
        'The rate is k[substrate] only — doubling or changing the base does not affect it',
        'In the fast second step a weak base removes a β-hydrogen, and those electrons form a new C=C',
        'When two β-hydrogens are available, the more substituted alkene is the major product (Zaitsev)',
      ],
    },
    {
      id: 'oc5-cold',
      step: 5,
      type: 'cold-problem',
      problems: [
        {
          id: 'oc5-cold-a',
          prompt: 'E1 rate = k[substrate]. The reaction order with respect to the substrate is ___.',
          correctValue: 1,
          feedbackWrong: {
            default: 'Only [substrate] appears in the rate law, to the first power — it is unimolecular.',
            specificCases: [
              { answer: 0, message: 'Zero order would drop [substrate] from the rate law, but it is the only species in it. The order is 1.' },
              { answer: 2, message: 'Second order is E2 (rate = k[base][substrate]). E1 is first order in substrate only.' },
            ],
          },
        },
        {
          id: 'oc5-cold-b',
          prompt: 'E1 proceeds in how many steps?',
          correctValue: 2,
          feedbackWrong: {
            default: 'Count them: first the leaving group leaves, then the base removes a β-hydrogen.',
            specificCases: [
              { answer: 1, message: 'One concerted step is E2. E1 goes through a carbocation intermediate, so it is 2 steps.' },
              { answer: 3, message: 'There are just two: form the carbocation, then lose the β-hydrogen.' },
            ],
          },
        },
      ],
    },
  ],
}
