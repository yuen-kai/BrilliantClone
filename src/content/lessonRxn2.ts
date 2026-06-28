import type { Lesson } from '../types/lesson'

/**
 * Reaction Mechanisms · Lesson 2 — SN2: Backside Attack & Inversion.
 * Builds on the curved arrows from Lesson 1: the same O→C / C–LG arrows, but now
 * the learner discovers *how* they happen in space — one concerted step, an
 * approach directly opposite the leaving group, and a centre that turns inside
 * out. The widget shows only structure; every number/choice is gated outside it.
 */
export const lessonRxn2: Lesson = {
  id: 'rxn-2',
  title: 'SN2: Backside Attack & Inversion',
  subject: 'Organic Chemistry · Substitution & Elimination',
  order: 2,
  prerequisiteLessonId: 'rxn-1',
  tagline: 'One push, from exactly the right side, and the whole centre flips inside out.',
  steps: [
    {
      id: 'rxn2-step1',
      step: 1,
      type: 'mechanism',
      prompt: 'Hydroxide meets 2-bromobutane. Bring the nucleophile in.',
      gateOnSolved: true,
      visual: {
        component: 'reaction-stage',
        config: {
          mode: 'attack',
          groups: ['H', 'CH₃', 'CH₂CH₃'],
          leavingGroup: 'Br',
          nucleophile: 'HO⁻',
          caption: 'Drag the nucleophile toward the carbon. Only one approach works.',
        },
      },
      gates: [
        {
          id: 'rxn2-s1-approach',
          label: 'Approach',
          prompt: 'Which approach formed the bond?',
          options: [
            { id: 'back', label: 'From the side opposite the leaving group' },
            { id: 'front', label: 'From the same side as the leaving group' },
            { id: 'side', label: 'Straight in at one of the C–H bonds' },
          ],
          correctId: 'back',
          feedback: {
            wrong: 'Only one direction let it through — the open side, directly away from the group that leaves.',
            byOption: {
              front: 'The leaving group and its bond are in the way on that side; the carbon is shielded there.',
              side: 'The other substituents block a sideways path; the clear line is straight opposite the leaving group.',
            },
          },
        },
        {
          id: 'rxn2-s1-groups',
          label: 'The other groups',
          prompt: 'As the new bond formed, the other three groups…',
          options: [
            { id: 'flip', label: 'Flipped through flat to the other side' },
            { id: 'stay', label: 'Stayed exactly where they were' },
            { id: 'spin', label: 'Spun around the C–Nu bond' },
          ],
          correctId: 'flip',
          feedback: {
            wrong: 'Watch the three bonds again — they sweep through a flat arrangement and end up pointing the opposite way, like an umbrella caught in the wind.',
          },
        },
      ],
    },
    {
      id: 'rxn2-step2',
      step: 2,
      type: 'mechanism',
      prompt: 'Does the leaving group depart first, or as the new bond forms?',
      gateOnSolved: true,
      visual: {
        component: 'reaction-stage',
        config: {
          mode: 'concerted',
          groups: ['H', 'CH₃', 'CH₃'],
          leavingGroup: 'Br',
          nucleophile: 'HO⁻',
          caption: 'Push it in as the group leaves — or try letting the group leave first.',
        },
      },
      gates: [
        {
          id: 'rxn2-s2-humps',
          label: 'Humps',
          prompt: 'On the path that works, how many humps does the energy climb over?',
          correctValue: 1,
          hintText: 'Count the peaks between start and product on the path that actually made it across.',
          feedbackWrong: {
            default: 'The working path rises to a single peak, then runs straight down to the product.',
            specificCases: [
              { answer: 2, message: 'Two humps would need a dip to rest in between — but the working path never pauses.' },
              { answer: 0, message: 'There is a barrier to get over; it is not downhill the whole way. Count its peaks.' },
            ],
          },
        },
        {
          id: 'rxn2-s2-cation',
          label: 'Intermediate',
          prompt: 'Does a separate carbocation form first, before the nucleophile bonds?',
          options: [
            { id: 'no', label: 'No — it is one smooth step' },
            { id: 'yes', label: 'Yes — it forms, then gets attacked' },
          ],
          correctId: 'no',
          feedback: {
            wrong: 'Letting the group leave first gave no resting point — the structure just fell back. The bond forms at the same time the group leaves.',
          },
        },
      ],
    },
    {
      id: 'rxn2-step3',
      step: 3,
      type: 'mechanism',
      prompt: 'Now try the same attack on a carbon ringed by three methyls.',
      gateOnSolved: true,
      visual: {
        component: 'reaction-stage',
        config: {
          mode: 'rate',
          groups: ['CH₃', 'CH₃', 'CH₃'],
          leavingGroup: 'Br',
          nucleophile: 'HO⁻',
          bulky: true,
          caption: 'Drag the nucleophile in toward the carbon.',
        },
      },
      gates: [
        {
          id: 'rxn2-s3-rate',
          label: 'Rate',
          prompt: 'Double BOTH [Nu] and [substrate] — the rate is ___× faster',
          correctValue: 4,
          hintText: 'Both appear once in rate = k[Nu][substrate]; doubling each one multiplies in.',
          feedbackWrong: {
            default: 'Two independent doublings multiply: 2 × 2.',
            specificCases: [
              { answer: 2, message: 'That doubles only one of them. Both [Nu] and [substrate] doubled, so multiply the two factors.' },
              { answer: 8, message: 'Each appears only to the first power, so it is 2 × 2, not 2³.' },
            ],
          },
        },
        {
          id: 'rxn2-s3-which',
          label: 'No reaction',
          prompt: 'Which carbon won’t react this way?',
          options: [
            { id: 'tert', label: 'tert-butyl (3°)' },
            { id: 'methyl', label: 'methyl' },
            { id: 'prim', label: '1° (ethyl)' },
          ],
          correctId: 'tert',
          feedback: {
            wrong: 'The more groups crowd the carbon, the harder it is to reach the open side opposite the leaving group.',
            byOption: {
              methyl: 'Methyl is the most exposed carbon of all — the easiest to reach, not the hardest.',
              prim: 'A 1° carbon still has room to get in; the one that was blocked carried three bulky groups.',
            },
          },
        },
      ],
    },
    {
      id: 'rxn2-rule',
      step: 4,
      type: 'rule-statement',
      explanation:
        'This is the SN2 reaction. It happens in ONE concerted step — the nucleophile bonds at the same instant the leaving group departs, so no carbocation ever forms. The nucleophile must approach from the side directly opposite the leaving group (~180°), and as the C–LG bond breaks the carbon turns inside out: inversion of configuration, the Walden inversion. Because both the nucleophile and the substrate take part in that single rate-determining step, rate = k[Nu][substrate] — second order. That backside path is wide open on methyl and 1° carbons, tighter on 2°, and essentially blocked on 3° (steric bulk), so reactivity runs methyl > 1° > 2° ≫ 3°. SN2 is favoured by a strong / negatively charged nucleophile, a polar aprotic solvent, and a good leaving group.',
      overlayExpression: 'SN2 · one concerted step · ~180° attack · inversion · rate = k[Nu][substrate]',
    },
    {
      id: 'rxn2-teach',
      step: 5,
      type: 'teach-back',
      concept: 'the SN2 mechanism',
      problem: 'Hydroxide (OH⁻) reacts with (R)-2-bromobutane.',
      prompt:
        'You’re the chemist — walk me through how this one goes, and why, including what happens to the configuration. I’ll nudge you if a detail slips.',
      keyPoints: [
        'OH⁻ attacks the carbon from the side directly opposite Br, about 180° away',
        'It is one concerted step — the bond forms as Br⁻ leaves, so no carbocation intermediate forms',
        'The stereocenter inverts, so (R)-2-bromobutane gives (S)-butan-2-ol (Walden inversion)',
        'Rate = k[OH⁻][substrate], so doubling [OH⁻] doubles the rate (second order overall)',
      ],
    },
    {
      id: 'rxn2-cold',
      step: 6,
      type: 'cold-problem',
      problems: [
        {
          id: 'rxn2-cold-a',
          prompt: 'An SN2 runs at rate r. You triple [Nu] and double [substrate]. The new rate = ___ · r',
          correctValue: 6,
          feedbackWrong: {
            default: 'rate = k[Nu][substrate]: each factor scales the rate, so multiply them — 3 × 2.',
            specificCases: [
              { answer: 5, message: 'Both partners are factors in the rate law, so you multiply them, not add: 3 × 2, not 3 + 2.' },
              { answer: 3, message: 'That counts only the nucleophile. The substrate also doubled, so include its factor too: 3 × 2.' },
            ],
          },
        },
        {
          id: 'rxn2-cold-b',
          prompt:
            '(S)-2-iodooctane reacts with CN⁻ by an SN2. Enter 1 if the product is inverted (R), or 2 if it keeps its (S) configuration.',
          correctValue: 1,
          feedbackWrong: {
            default: 'SN2 attacks from directly opposite the leaving group, so the centre always flips.',
            specificCases: [
              { answer: 2, message: 'Keeping the configuration would require a front-side approach; SN2 inverts every time, so the label flips to (R).' },
            ],
          },
        },
      ],
    },
  ],
}
