import type { Lesson } from '../types/lesson'
import type { NewmanDialConfig } from '../types/orgo'

/** Sight down the Cα–Cβ bond. Br (front, 12 o'clock) is the leaving group; the
 * two H's on the back carbon are the removable β-hydrogens. Rotate the back
 * carbon until a β-H is anti (opposite Br), then methoxide eliminates. */
const newman: NewmanDialConfig = {
  base: 'CH₃O⁻',
  front: [{ label: 'Br', lg: true }, { label: 'CH₃' }, { label: 'H' }],
  back: [{ label: 'H', betaH: true }, { label: 'CH₃' }, { label: 'H', betaH: true }],
  antiToleranceDeg: 25,
  caption: 'Drag to rotate the back carbon. Fill the overlap meter, then tap the base to eliminate.',
}

export const oc4: Lesson = {
  id: 'oc-4',
  title: 'E2: Anti-Periplanar Elimination',
  subject: 'Organic Chemistry · Mechanisms',
  order: 4,
  prerequisiteLessonId: 'oc-3',
  tagline: 'One push, one pull, all at once — line up the bonds and watch a double bond snap into place.',
  completionMessage: 'You can run an E2: rotate to anti-periplanar, eliminate in one concerted step, and form the alkene.',
  steps: [
    {
      id: 'oc4-newman',
      step: 1,
      type: 'orgo',
      prompt: 'Line up a β-hydrogen opposite the leaving group, then let the base strike.',
      visual: { component: 'newman-dial', config: newman },
      gateOnSolved: true,
      gateOnSolvedHint: 'Rotate to anti-periplanar, then eliminate.',
      gates: [
        {
          id: 'oc4-newman-angle',
          label: 'Dihedral',
          prompt: 'At what dihedral angle (degrees) is a β-H anti-periplanar to the leaving group?',
          correctValue: 180,
          feedbackWrong: {
            default: 'Anti means pointing exactly opposite — straight across the C–C bond.',
            specificCases: [
              { answer: 0, message: '0° is eclipsed: the H sits right on top of the leaving group, not opposite it.' },
              { answer: 90, message: '90° is gauche, not opposite. Keep turning until the H is directly across.' },
              { answer: 360, message: 'A full turn lands back at the start. Anti is exactly half a turn from eclipsed.' },
            ],
          },
          revealExpression: '180°',
        },
        {
          id: 'oc4-newman-remove',
          label: 'Base removes',
          prompt: 'What does the base remove?',
          options: [
            { id: 'bh', label: 'A β-hydrogen (on the carbon next to the LG)' },
            { id: 'lg', label: 'The leaving group' },
            { id: 'ac', label: 'The α-carbon' },
          ],
          correctId: 'bh',
          feedback: {
            wrong: 'The base grabs an atom while the leaving group departs on its own.',
            byOption: {
              lg: 'The leaving group leaves by itself, taking the bonding electrons — the base doesn’t pull it off.',
              ac: 'The α-carbon carries the LG and stays in the molecule; it becomes part of the new C=C.',
            },
          },
        },
      ],
    },
    {
      id: 'oc4-overlap',
      step: 2,
      type: 'orgo',
      prompt: 'You felt the overlap peak at one alignment. Why does geometry matter so much?',
      gates: [
        {
          id: 'oc4-overlap-why',
          label: 'Why anti',
          prompt: 'Why must the β-H and leaving group be anti-periplanar?',
          options: [
            { id: 'orb', label: 'Their orbitals align for the best overlap to form the π bond' },
            { id: 'ster', label: 'Only to reduce steric strain' },
            { id: 'arb', label: 'It’s arbitrary — any angle works' },
          ],
          correctId: 'orb',
          feedback: {
            wrong: 'Think about the two breaking σ bonds becoming one new π bond.',
            byOption: {
              ster: 'Sterics shape conformations, but the real requirement is electronic: the orbitals must line up.',
              arb: 'Geometry is strict — only the anti alignment lets the breaking orbitals overlap into a π bond.',
            },
          },
        },
        {
          id: 'oc4-overlap-steps',
          label: 'Steps',
          prompt: 'How many steps does an E2 reaction take?',
          correctValue: 1,
          feedbackWrong: {
            default: 'E2 is concerted — base removal, LG departure, and π-bond formation happen together.',
            specificCases: [
              { answer: 2, message: 'Two steps would need an intermediate — that’s E1. E2 has none.' },
              { answer: 3, message: 'Three arrows fire, but they fire simultaneously in a single step.' },
            ],
          },
          revealExpression: '1 step',
        },
      ],
    },
    {
      id: 'oc4-rule',
      step: 3,
      type: 'rule-statement',
      explanation:
        'E2 is one concerted, bimolecular step: a strong base pulls off a β-hydrogen at the same instant the leaving group departs, and the electrons left behind become a new C=C π bond — an alkene. It only works when the β-H and the leaving group are anti-periplanar (a 180° dihedral), because that lineup lets the breaking σ orbitals overlap into the π bond. The rate depends on both partners — rate = k[base][substrate] — so strong bases favor it.',
      overlayExpression: 'rate = k [base] [substrate]   ·   β-H + LG anti (180°) → alkene',
    },
    {
      id: 'oc4-teach',
      step: 4,
      type: 'teach-back',
      concept: 'the E2 mechanism',
      problem:
        'Methoxide (CH₃O⁻) reacts with 2-bromobutane in an E2 reaction to give but-2-ene. Walk through what the base does, which bonds break and form, and the geometry the reaction needs.',
      prompt: 'Teach me E2. What does the base do, which bonds break and form, and what has to line up?',
      keyPoints: [
        'E2 happens in one concerted, bimolecular step — there is no intermediate',
        'The base removes a β-hydrogen (on the carbon next to the C–Br) as the bromide leaves',
        'The β-H and the leaving group must be anti-periplanar (a 180° dihedral) so their orbitals overlap',
        'The electrons left behind form a new C=C π bond, giving the alkene',
        'The rate depends on BOTH [base] and [substrate]: rate = k[base][substrate]',
      ],
    },
    {
      id: 'oc4-cold',
      step: 5,
      type: 'cold-problem',
      problems: [
        {
          id: 'oc4-cold-a',
          prompt: 'Anti-periplanar means the β-H and the leaving group sit at a dihedral angle of ___ degrees.',
          correctValue: 180,
          feedbackWrong: {
            default: 'Anti = pointing exactly opposite across the C–C bond.',
            specificCases: [
              { answer: 0, message: '0° is eclipsed (the H sits on top of the LG). Anti is the opposite extreme.' },
              { answer: 90, message: '90° is gauche. Anti is a straight 180° across.' },
            ],
          },
        },
        {
          id: 'oc4-cold-b',
          prompt: 'E2 rate = k[base][substrate]. Doubling BOTH concentrations multiplies the rate by ___.',
          correctValue: 4,
          feedbackWrong: {
            default: 'Rate is first order in each partner, so multiply the two factors together.',
            specificCases: [
              { answer: 2, message: 'Doubling only one partner doubles the rate; here you double both (2 × 2).' },
              { answer: 1, message: 'Both concentrations rose, so the rate must climb, not hold steady.' },
            ],
          },
        },
      ],
    },
  ],
}
