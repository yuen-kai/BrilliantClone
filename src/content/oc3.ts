import type { Lesson } from '../types/lesson'
import type { CarbocationFacesConfig } from '../types/orgo'

/** A chiral 3° substrate (methyl / ethyl / propyl on the central carbon) so the
 * two faces of attack genuinely give enantiomers — i.e. real racemization. */
const sn1Scene: CarbocationFacesConfig = {
  groups: ['CH₃', 'C₂H₅', 'C₃H₇'],
  leavingGroup: 'Br',
  nucleophile: 'H₂O',
  caption: 'Drag the leaving group away — let the carbon ionize on its own.',
}

export const oc3: Lesson = {
  id: 'oc-3',
  title: 'SN1: Carbocations & Racemization',
  subject: 'Organic Chemistry · Mechanisms',
  order: 3,
  prerequisiteLessonId: 'oc-2',
  tagline: 'Walk away and the carbon collapses flat — so the nucleophile can hit either side.',
  completionMessage: 'SN1, locked in: ionize to a flat carbocation, then attack from both faces — racemization.',
  steps: [
    {
      id: 'oc3-ionize',
      step: 1,
      type: 'orgo',
      prompt: 'Leave it be. Pull the leaving group off and watch the carbon.',
      visual: { component: 'carbocation-faces', config: sn1Scene },
      gateOnSolved: true,
      gateOnSolvedHint: 'Pull off the leaving group and let the nucleophile bond, then answer below.',
      gates: [
        {
          id: 'oc3-ionize-shape',
          label: 'Carbocation',
          prompt: 'After the leaving group leaves, the carbon becomes…',
          options: [
            { id: 'planar', label: 'a flat (trigonal planar) carbocation' },
            { id: 'anion', label: 'a tetrahedral anion' },
            { id: 'same', label: 'unchanged' },
          ],
          correctId: 'planar',
          feedback: {
            wrong: 'Watch the centre — it lost a group, flattened to 120°, and opened an empty p-orbital.',
            byOption: {
              anion: 'The leaving group took the bonding electrons, so the carbon is electron-poor (+), not negative.',
              same: 'It changed shape: the three groups spread into one flat plane.',
            },
          },
        },
        {
          id: 'oc3-ionize-rate',
          label: 'Rate',
          prompt: 'SN1 rate = k[substrate]. If you double the nucleophile concentration, the rate multiplies by ___.',
          correctValue: 1,
          feedbackWrong: {
            default: 'The slow step is just the leaving group leaving — the nucleophile isn’t in the rate law.',
            specificCases: [
              { answer: 2, message: 'That’s SN2 thinking. The nucleophile isn’t in the rate-determining step, so it’s not ×2.' },
              { answer: 0, message: 'The reaction still runs — adding nucleophile just doesn’t speed it up. The multiplier is ×1.' },
            ],
          },
          revealExpression: '× 1',
        },
      ],
    },
    {
      id: 'oc3-faces',
      step: 2,
      type: 'orgo',
      prompt: 'The carbon is flat now. Send the nucleophile in — try both sides.',
      visual: { component: 'carbocation-faces', config: sn1Scene },
      gateOnSolved: true,
      gateOnSolvedHint: 'Send the nucleophile to one of the two faces, then answer below.',
      gates: [
        {
          id: 'oc3-faces-count',
          label: 'Faces',
          prompt: 'From how many faces can the nucleophile attack the flat carbocation?',
          correctValue: 2,
          feedbackWrong: {
            default: 'The carbon is flat with an empty p-orbital — a lobe on each side.',
            specificCases: [
              { answer: 1, message: 'Both sides of the plane are open. Drag the nucleophile to the other lobe too.' },
              { answer: 4, message: 'Only the two faces of the plane (top and bottom) are open — that’s 2.' },
            ],
          },
          revealExpression: '2 faces',
        },
        {
          id: 'oc3-faces-product',
          label: 'Product',
          prompt: 'Either face is equally likely, so the product is…',
          options: [
            { id: 'racemic', label: 'a 50:50 racemic mixture of both enantiomers' },
            { id: 'single', label: 'a single enantiomer' },
            { id: 'none', label: 'no reaction' },
          ],
          correctId: 'racemic',
          feedback: {
            wrong: 'Each face gives one mirror image, and both faces are equally likely.',
            byOption: {
              single: 'A single enantiomer needs one face blocked — but a flat cation is open on both sides.',
              none: 'It does react; the nucleophile bonds from whichever face it lands on.',
            },
          },
        },
      ],
    },
    {
      id: 'oc3-rule',
      step: 3,
      type: 'rule-statement',
      explanation:
        'SN1 is two steps. First (slow, rate-determining) the leaving group departs on its own, giving a flat sp² carbocation — so the rate is k[substrate] only, first-order and independent of the nucleophile (unimolecular). Then (fast) the nucleophile attacks the planar cation from either face with equal odds, so a single starting enantiomer becomes a 50:50 racemic mixture. Because the slow step builds a carbocation, stability decides everything: 3° > 2° > 1°, so SN1 favors 3° substrates — the exact opposite of SN2.',
      overlayExpression: 'rate = k [substrate]   ·   flat cation → attack both faces → racemic',
    },
    {
      id: 'oc3-teach',
      step: 4,
      type: 'teach-back',
      concept: 'the SN1 mechanism',
      problem:
        '(R)-3-bromo-3-methylhexane is dissolved in water and gives the alcohol. Walk through what happens to the C–Br carbon, why the rate ignores the water concentration, and what the product mixture looks like.',
      prompt: 'Teach me SN1 on this one. What happens first, what does the carbon become, and what comes out?',
      keyPoints: [
        'SN1 happens in two steps, not one concerted push',
        'The slow, rate-determining first step is the leaving group leaving to form a carbocation',
        'That carbocation is flat — sp², trigonal planar, with an empty p-orbital',
        'The rate is k[substrate] only; doubling the nucleophile concentration does nothing to it',
        'The nucleophile attacks both faces equally, so the product is a 50:50 racemic mixture',
      ],
    },
    {
      id: 'oc3-cold',
      step: 5,
      type: 'cold-problem',
      problems: [
        {
          id: 'oc3-cold-a',
          prompt: 'SN1 rate = k[R–Br]. Double the nucleophile concentration; the rate multiplies by ___.',
          correctValue: 1,
          feedbackWrong: {
            default: 'The nucleophile isn’t in the rate-determining step, so its concentration doesn’t change the rate.',
            specificCases: [
              { answer: 2, message: 'Doubling a species only doubles the rate if it’s in the rate law — the nucleophile isn’t.' },
            ],
          },
        },
        {
          id: 'oc3-cold-b',
          prompt: 'A flat (planar) carbocation can be attacked from how many faces?',
          correctValue: 2,
          feedbackWrong: {
            default: 'It’s flat with an empty p-orbital — open on each side of the plane.',
            specificCases: [
              { answer: 1, message: 'Both sides of the plane are open — that’s two faces, which is why you get racemization.' },
            ],
          },
        },
      ],
    },
  ],
}
