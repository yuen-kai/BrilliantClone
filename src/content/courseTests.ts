/**
 * End-of-course tests. Each one mixes problems drawn from across the whole
 * course (roughly one per lesson) into a single graded check. They live here
 * (not in the per-lesson content) and are keyed by course id; the course path
 * shows a "Course test" node once every lesson is mastered.
 */

export type TestQuestion =
  | {
      id: string
      kind: 'numeric'
      /** Which lesson/idea this draws from (shown as a small tag). */
      from: string
      prompt: string
      correctValue: number
      explain?: string
    }
  | {
      id: string
      kind: 'choice'
      from: string
      prompt: string
      options: { id: string; label: string }[]
      correctId: string
      explain?: string
    }

export type CourseTest = {
  title: string
  intro: string
  /** Fraction of questions required to pass (0–1). */
  passThreshold: number
  questions: TestQuestion[]
}

const countingTest: CourseTest = {
  title: 'Counting Strategies — Course Test',
  intro: 'Six problems, one from each strategy you learned. Pick the right tool for each.',
  passThreshold: 0.7,
  questions: [
    {
      id: 'ct-c-1',
      kind: 'numeric',
      from: 'Multiplication',
      prompt: 'A combo meal picks 1 of 3 mains, 1 of 4 sides, and 1 of 2 drinks. How many different combos?',
      correctValue: 24,
      explain: 'Sequential independent choices multiply: 3 × 4 × 2 = 24.',
    },
    {
      id: 'ct-c-2',
      kind: 'numeric',
      from: 'Combinations',
      prompt: 'A pizza lets you choose 2 toppings from 6 (order doesn’t matter). How many topping pairs?',
      correctValue: 15,
      explain: 'Order doesn’t matter → C(6, 2) = 15.',
    },
    {
      id: 'ct-c-3',
      kind: 'numeric',
      from: 'Overcounting',
      prompt: 'How many distinct arrangements are there of the letters in BANANA?',
      correctValue: 60,
      explain: '6! divided by the repeats: 6! / (3! · 2!) = 720 / 12 = 60 (three A’s, two N’s).',
    },
    {
      id: 'ct-c-4',
      kind: 'numeric',
      from: 'Casework',
      prompt: 'Roll two dice. In how many of the 36 outcomes is the sum 5 or 6?',
      correctValue: 9,
      explain: 'Case sum = 5: 4 ways; case sum = 6: 5 ways; add the cases → 9.',
    },
    {
      id: 'ct-c-5',
      kind: 'numeric',
      from: 'Complementary',
      prompt: 'Flip a fair coin 4 times. How many of the outcomes have at least one head?',
      correctValue: 15,
      explain: 'Total 2⁴ = 16 minus the one all-tails outcome → 16 − 1 = 15.',
    },
    {
      id: 'ct-c-6',
      kind: 'numeric',
      from: 'Stars & Bars',
      prompt: 'How many ways can 6 identical candies be shared among 3 children (a child may get none)?',
      correctValue: 28,
      explain: 'Stars & bars: C(6 + 3 − 1, 3 − 1) = C(8, 2) = 28.',
    },
  ],
}

const reactionsTest: CourseTest = {
  title: 'Reaction Mechanisms — Course Test',
  intro: 'Seven problems mixing curved arrows, SN2, SN1, E2, E1, and choosing the pathway.',
  passThreshold: 0.7,
  questions: [
    {
      id: 'ct-r-1',
      kind: 'numeric',
      from: 'Curved Arrows',
      prompt: 'Water (H₂O) reacts with H–Br to give H₃O⁺ + Br⁻. How many curved arrows does this step need?',
      correctValue: 2,
      explain: 'One arrow makes the O–H bond; a second must break H–Br (H can hold only 2 electrons).',
    },
    {
      id: 'ct-r-2',
      kind: 'choice',
      from: 'SN2',
      prompt: 'An SN2 reaction on (R)-2-bromobutane gives a product whose configuration is:',
      options: [
        { id: 'inv', label: 'Inverted (S)' },
        { id: 'ret', label: 'Retained (R)' },
        { id: 'rac', label: 'Racemic (50:50)' },
      ],
      correctId: 'inv',
      explain: 'SN2 is backside attack → Walden inversion, so R becomes S.',
    },
    {
      id: 'ct-r-3',
      kind: 'numeric',
      from: 'SN1',
      prompt: 'In an SN1 reaction you double the nucleophile concentration. The rate multiplies by ___.',
      correctValue: 1,
      explain: 'SN1 is first order in substrate only — the nucleophile attacks after the slow step.',
    },
    {
      id: 'ct-r-4',
      kind: 'choice',
      from: 'E2',
      prompt: 'For E2 to occur, the β-hydrogen and the leaving group must be:',
      options: [
        { id: 'anti', label: 'Anti-periplanar (~180°)' },
        { id: 'ecl', label: 'Eclipsed (0°)' },
        { id: 'gau', label: 'Gauche (60°)' },
      ],
      correctId: 'anti',
      explain: 'The breaking σ bonds must align with the forming π bond — anti-periplanar.',
    },
    {
      id: 'ct-r-5',
      kind: 'numeric',
      from: 'E1',
      prompt: 'Doubling the base concentration multiplies the E1 rate by ___.',
      correctValue: 1,
      explain: 'E1 is first order in substrate; the base acts after the slow ionization step.',
    },
    {
      id: 'ct-r-6',
      kind: 'choice',
      from: 'Choosing the Pathway',
      prompt: 'A 3° substrate with a strong, bulky base, heated, reacts mainly by:',
      options: [
        { id: 'sn1', label: 'SN1' },
        { id: 'sn2', label: 'SN2' },
        { id: 'e1', label: 'E1' },
        { id: 'e2', label: 'E2' },
      ],
      correctId: 'e2',
      explain: 'No SN2 on 3°; a strong base eliminates in one concerted step → E2 (heat favors elimination).',
    },
    {
      id: 'ct-r-7',
      kind: 'choice',
      from: 'Choosing the Pathway',
      prompt: 'A 1° substrate with a strong nucleophile (CN⁻) in a polar aprotic solvent reacts mainly by:',
      options: [
        { id: 'sn1', label: 'SN1' },
        { id: 'sn2', label: 'SN2' },
        { id: 'e1', label: 'E1' },
        { id: 'e2', label: 'E2' },
      ],
      correctId: 'sn2',
      explain: '1° can’t ionize (no SN1/E1); a strong nucleophile in polar aprotic solvent is textbook SN2.',
    },
  ],
}

const orgoTest: CourseTest = {
  title: 'Substitution & Elimination — Course Test',
  intro: 'Seven problems spanning nucleophiles, SN2/SN1, E2/E1, and how to pick the pathway.',
  passThreshold: 0.7,
  questions: [
    {
      id: 'ct-o-1',
      kind: 'choice',
      from: 'Nucleophiles & Electrophiles',
      prompt: 'A nucleophile is the species that:',
      options: [
        { id: 'rich', label: 'Is electron-rich and donates a pair' },
        { id: 'poor', label: 'Is electron-poor and accepts a pair' },
        { id: 'pos', label: 'Is always positively charged' },
      ],
      correctId: 'rich',
      explain: 'Nucleophile = electron-rich (a lone pair, π bond, or negative charge) that attacks an electrophile.',
    },
    {
      id: 'ct-o-2',
      kind: 'choice',
      from: 'SN2',
      prompt: 'SN2 is fastest on which substrate?',
      options: [
        { id: 'me', label: 'Methyl' },
        { id: '2', label: 'Secondary (2°)' },
        { id: '3', label: 'Tertiary (3°)' },
      ],
      correctId: 'me',
      explain: 'Backside attack needs an open carbon: methyl > 1° > 2° ≫ 3° (3° is blocked).',
    },
    {
      id: 'ct-o-3',
      kind: 'choice',
      from: 'SN1',
      prompt: 'SN1 on a single enantiomer at the reacting stereocenter gives:',
      options: [
        { id: 'rac', label: 'A racemic (~50:50) mixture' },
        { id: 'inv', label: 'A single inverted product' },
        { id: 'ret', label: 'A single retained product' },
      ],
      correctId: 'rac',
      explain: 'The planar carbocation is attacked from both faces equally → racemization.',
    },
    {
      id: 'ct-o-4',
      kind: 'choice',
      from: 'E2',
      prompt: 'Which base favors the less-substituted (Hofmann) alkene in an E2?',
      options: [
        { id: 'bulky', label: 'A bulky base (e.g. tert-butoxide)' },
        { id: 'small', label: 'A small base (e.g. ethoxide)' },
        { id: 'none', label: 'Base size doesn’t matter' },
      ],
      correctId: 'bulky',
      explain: 'A bulky base can’t reach the crowded internal H, so it takes the accessible one → Hofmann.',
    },
    {
      id: 'ct-o-5',
      kind: 'numeric',
      from: 'Kinetics',
      prompt: 'An SN2 follows rate = k[Nu][substrate]. Triple [Nu] and double [substrate]: the rate rises by a factor of ___.',
      correctValue: 6,
      explain: 'Both appear in the rate law and multiply: 3 × 2 = 6.',
    },
    {
      id: 'ct-o-6',
      kind: 'choice',
      from: 'Choosing the Pathway',
      prompt: 'A polar aprotic solvent (e.g. DMSO, acetone) favors which mechanism?',
      options: [
        { id: 'sn2', label: 'SN2' },
        { id: 'sn1', label: 'SN1' },
        { id: 'e1', label: 'E1' },
      ],
      correctId: 'sn2',
      explain: 'Polar aprotic solvents leave the nucleophile reactive → SN2 (protic favors SN1/E1).',
    },
    {
      id: 'ct-o-7',
      kind: 'choice',
      from: 'Choosing the Pathway',
      prompt: 'Raising the temperature generally favors:',
      options: [
        { id: 'elim', label: 'Elimination (E1/E2)' },
        { id: 'sub', label: 'Substitution (SN1/SN2)' },
        { id: 'neither', label: 'Neither' },
      ],
      correctId: 'elim',
      explain: 'Heat favors elimination (it’s entropically favored — more product molecules).',
    },
  ],
}

export const courseTests: Record<string, CourseTest> = {
  counting: countingTest,
  reactions: reactionsTest,
  orgo: orgoTest,
}

export function getCourseTest(courseId: string | undefined): CourseTest | undefined {
  return courseId ? courseTests[courseId] : undefined
}

/** Progress id used to persist a course-test result (mastered = passed). */
export function courseTestProgressId(courseId: string): string {
  return `${courseId}-test`
}
