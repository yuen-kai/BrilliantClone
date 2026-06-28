import type { Lesson } from '../types/lesson'

/**
 * Reaction Mechanisms · Lesson 4 — E2: Anti-Periplanar Elimination.
 * Looking down the Cα–Cβ bond on a Newman projection, the learner spins the back
 * carbon until a β-hydrogen lines up directly opposite the leaving group. Only
 * then can the base reach it: three arrows fire at once (base→βH, the Cβ–H bond
 * becomes the C=C π bond, the Cα–LG bond leaves) and the molecule snaps flat. No
 * carbocation; a small base gives Zaitsev, a bulky base gives Hofmann.
 */
export const lessonRxn4: Lesson = {
  id: 'rxn-4',
  title: 'E2: Anti-Periplanar Elimination',
  subject: 'Organic Chemistry · Substitution & Elimination',
  order: 4,
  prerequisiteLessonId: 'rxn-3',
  tagline: 'One concerted shove: line the hydrogen up opposite the leaving group, and the double bond springs out.',
  steps: [
    {
      id: 'rxn4-anti',
      step: 1,
      type: 'mechanism',
      prompt: 'Ethoxide meets bromoethane. Spin the back carbon to drive the elimination.',
      gateOnSolved: true,
      visual: {
        component: 'newman-eliminate',
        config: {
          leavingGroup: 'Br',
          base: 'EtO⁻',
          antiToleranceDeg: 15,
          caption: 'Drag anywhere on the back carbon to spin it, then react once a β-hydrogen lines up with the base.',
          front: [{ label: 'Br', lg: true }, { label: 'H' }, { label: 'H' }],
          back: [
            { label: 'H', betaH: true },
            { label: 'H', betaH: true },
            { label: 'H', betaH: true },
          ],
        },
      },
      gates: [
        {
          id: 'rxn4-s1-angle',
          label: 'Alignment',
          prompt: 'It only fired at one alignment — what H–C–C–LG angle let it go?',
          correctValue: 180,
          feedbackWrong: {
            default: 'It fired only when the β-hydrogen pointed straight opposite the leaving group — half a full turn apart.',
            specificCases: [
              { answer: 0, message: '0° is eclipsed (syn): the hydrogen sits right on top of the leaving group — that one is rejected.' },
              { answer: 120, message: '120° is gauche — close, but the base still can’t reach. It needs the hydrogen directly opposite.' },
              { answer: 90, message: 'At 90° the hydrogen and leaving group are perpendicular, not opposed — no fire.' },
              { answer: 360, message: 'A full turn just returns to the start. The reactive alignment is half a turn — straight across.' },
            ],
          },
        },
        {
          id: 'rxn4-s1-bonds',
          label: 'Bonds changed',
          prompt: 'In that one snap, how many bonds break or form at once?',
          correctValue: 3,
          feedbackWrong: {
            default: 'Re-watch the snap: three curved arrows fired together — the base takes the H, the C=C π bond forms, and the C–Br bond breaks.',
            specificCases: [
              { answer: 1, message: 'E2 is concerted — three arrows move at once: base→H, the new π bond, and C–Br leaving.' },
              { answer: 2, message: 'One more: the base also forms its bond to the hydrogen. Three arrows fired together.' },
              { answer: 4, message: 'Count the curved arrows that fired — there were three simultaneous pushes.' },
            ],
          },
        },
      ],
    },
    {
      id: 'rxn4-zaitsev',
      step: 2,
      type: 'mechanism',
      prompt: 'Now 2-bromobutane with a small base. Drive one elimination, then weigh the products.',
      gateOnSolved: true,
      visual: {
        component: 'newman-eliminate',
        config: {
          leavingGroup: 'Br',
          base: 'EtO⁻',
          antiToleranceDeg: 15,
          caption: 'Spin the back carbon (the inner CH₂) and react when one of its hydrogens lines up with the base.',
          front: [{ label: 'Br', lg: true }, { label: 'CH₃' }, { label: 'H' }],
          back: [
            { label: 'H', betaH: true },
            { label: 'H', betaH: true },
            { label: 'CH₃' },
          ],
        },
      },
      gates: [
        {
          id: 'rxn4-s2-count',
          label: 'Possible alkenes',
          prompt: 'Counting both β-carbons, how many distinct alkenes (by double-bond position) are possible here?',
          correctValue: 2,
          feedbackWrong: {
            default: '2-bromobutane has β-hydrogens on two different carbons, so the double bond can form in two places.',
            specificCases: [
              { answer: 1, message: 'Both neighbouring carbons carry β-hydrogens — each gives a different alkene.' },
              { answer: 3, message: 'Only the two β-carbons bear removable hydrogens, so just two positional alkenes are possible.' },
            ],
          },
        },
        {
          id: 'rxn4-s2-major',
          label: 'Major product',
          prompt: 'With this small base, which alkene forms in greater amount?',
          options: [
            { id: 'but2', label: 'But-2-ene (CH₃–CH=CH–CH₃)' },
            { id: 'but1', label: 'But-1-ene (CH₂=CH–CH₂CH₃)' },
          ],
          correctId: 'but2',
          feedback: {
            wrong: 'A small base follows Zaitsev — it gives the more-substituted, more-stable alkene.',
            byOption: {
              but1: 'But-1-ene is the less-substituted (Hofmann) alkene. A small base prefers the more-substituted one.',
            },
          },
        },
      ],
    },
    {
      id: 'rxn4-hofmann',
      step: 3,
      type: 'mechanism',
      prompt: 'Same substrate, but swap in a bulky base. Now the only hydrogens it can reach are on the terminal carbon.',
      gateOnSolved: true,
      visual: {
        component: 'newman-eliminate',
        config: {
          leavingGroup: 'Br',
          base: 't-BuO⁻',
          antiToleranceDeg: 15,
          caption: 'Spin the back carbon (the terminal CH₃) and react when one of its hydrogens lines up with the bulky base.',
          front: [{ label: 'Br', lg: true }, { label: 'C₂H₅' }, { label: 'H' }],
          back: [
            { label: 'H', betaH: true },
            { label: 'H', betaH: true },
            { label: 'H', betaH: true },
          ],
        },
      },
      gates: [
        {
          id: 'rxn4-s3-major',
          label: 'Major product',
          prompt: 'With the bulky base, which alkene is major now?',
          options: [
            { id: 'but1', label: 'But-1-ene (terminal, less substituted)' },
            { id: 'but2', label: 'But-2-ene (internal, more substituted)' },
          ],
          correctId: 'but1',
          feedback: {
            wrong: 'A bulky base can’t squeeze in to the crowded internal hydrogens, so it grabs a terminal one — the Hofmann (less-substituted) alkene.',
            byOption: {
              but2: 'That’s the Zaitsev product a small base gives. A bulky base is too big for the internal hydrogen and goes terminal instead.',
            },
          },
        },
      ],
    },
    {
      id: 'rxn4-rule',
      step: 4,
      type: 'rule-statement',
      explanation:
        'E2 (bimolecular elimination) is a single concerted step: a base removes a β-hydrogen at the same instant the C–leaving-group bond breaks and a C=C π bond forms — three curved arrows at once, with no carbocation intermediate. It requires the β-hydrogen and the leaving group to be anti-periplanar (~180° dihedral) so the breaking bonds are aligned to become the new π bond. Because both the base and the substrate appear in the rate-determining step, rate = k[base][substrate] (second order). A small base follows Zaitsev (the more-substituted, more-stable alkene), while a bulky base cannot reach the crowded internal hydrogens and gives the Hofmann (less-substituted) alkene.',
      overlayExpression: 'anti-periplanar β-H + base → 3 arrows at once → C=C (no carbocation) · rate = k[base][substrate]',
    },
    {
      id: 'rxn4-teach',
      step: 5,
      type: 'teach-back',
      concept: 'the E2 mechanism',
      problem: 'Explain why 2-bromobutane plus ethoxide (a small base) gives mainly but-2-ene.',
      prompt: 'You’re the chemist — walk me through the E2 step and why the major product is what it is. I’ll nudge you if a rule slips.',
      keyPoints: [
        'E2 is one concerted, bimolecular step: the base removes a β-hydrogen while the C–Br bond breaks and the C=C π bond forms — three arrows at once, with no carbocation',
        'The β-hydrogen and the bromine must be anti-periplanar (~180°) for the reaction to go',
        'Ethoxide is a small base, so it follows Zaitsev and gives the more-substituted, more-stable alkene (but-2-ene over but-1-ene)',
        'Rate = k[base][substrate], so it is second order overall',
      ],
    },
    {
      id: 'rxn4-cold',
      step: 6,
      type: 'cold-problem',
      problems: [
        {
          id: 'rxn4-cold-a',
          prompt:
            'A rigid ring locks the substrate’s only β-hydrogen gauche to the leaving group, and it cannot rotate to anti. Enter 1 if this substrate can still do E2, or 2 if it cannot.',
          correctValue: 2,
          feedbackWrong: {
            default: 'E2 needs the β-hydrogen and the leaving group anti-periplanar. If they can’t reach ~180°, the concerted step can’t happen.',
            specificCases: [
              { answer: 1, message: 'Without an anti-periplanar β-H, the breaking bonds can’t align into the π bond — no E2.' },
            ],
          },
        },
        {
          id: 'rxn4-cold-b',
          prompt:
            '2-bromo-2-methylbutane + ethoxide (a small base), heated. Enter 1 if the Zaitsev (more-substituted) alkene is major, or 2 if the Hofmann (less-substituted) alkene is major.',
          correctValue: 1,
          feedbackWrong: {
            default: 'A small base follows Zaitsev — the more-substituted alkene is the major product.',
            specificCases: [
              { answer: 2, message: 'Hofmann is the bulky-base outcome. With a small base like ethoxide, Zaitsev (more-substituted) wins.' },
            ],
          },
        },
      ],
    },
  ],
}
