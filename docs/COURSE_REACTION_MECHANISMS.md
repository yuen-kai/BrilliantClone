# Course Design — "Reaction Mechanisms" (Organic Chemistry · Substitution & Elimination)

> **Status: BUILT — playable in-app at `/course/reactions` (lessons `rxn-1`…`rxn-6`), all six interactions screenshot-approved via a coder↔evaluator loop.** A reaction-heavy organic chemistry unit.
> Produced by outlining the curriculum, then running one **evaluator agent per lesson**
> (Opus 4.8) — each spawned its own **generator agent** (12 interaction ideas per lesson,
> 72 total), scored them against a rubric distilled from `docs/PREFERENCES.md` plus a
> chemistry-fidelity criterion, and returned the winning interaction. Every interaction
> below survived that bake-off, with feasibility grounded in the existing data-driven
> lesson engine and the real pointer-drag primitives (`HandshakeConnect`, `RoundTable`).

This is a **mechanism-dense** unit: every lesson is a reaction, taught by pushing
electrons. The unit's engineering payoff is a single reusable **curved-arrow canvas**
that, once built, makes three of the six lessons almost pure data.

---

## 1. The course at a glance

**Title:** Reaction Mechanisms
**Subject string:** `Organic Chemistry · Substitution & Elimination`
**Lessons:** 6, each following the proven Lesson-1 arc:
*3 hands-on discovery steps → name the rule → teach-back → cold problem.*

| # | Lesson | Mechanism / idea | Signature gesture | New visual |
|---|--------|------------------|-------------------|------------|
| 1 | **Curved Arrows: Nu & E⁺** | Electrons flow rich→poor; tail on electrons | Drag a double-barbed arrow from a lone pair/bond to the electrophile; octet/duet meter forces a 2nd arrow | `MechanismCanvas` |
| 2 | **SN2: Backside Attack & Inversion** | Concerted, 2nd-order, inversion, sterics | Drag Nu in — only backside bonds; the center umbrella-flips; 1-hump energy trace | `ReactionStage` |
| 3 | **SN1: Carbocations & Racemization** | Stepwise, 1st-order, planar cation, racemic | Pull the LG off → carbon flattens → attack either face → 50:50 R/S; 2-hump trace | `MechanismCanvas` + `RateLab` |
| 4 | **E2: Anti-Periplanar Elimination** | Concerted, bimolecular, anti req., Zaitsev | Rotate a Newman to anti, then fire 3 arrows at once | `NewmanEliminate` |
| 5 | **E1: Carbocation Elimination** | Stepwise; shares SN1's cation; Zaitsev; heat | From the cation, fork: attack C (SN1) vs take a β-H (E1) | `MechanismCanvas` (fork) |
| 6 | **Choosing the Pathway** | SN1/SN2/E1/E2 competition | Dial substrate/reagent/solvent/heat → verdict + product reveal | `ReactionConsole` + `MechanismTree` |

The arc is deliberately cumulative: **curved arrows (the toolkit) → SN2 → SN1 (its mirror)
→ E2 → E1 (shares SN1's cation) → the four-way decision.** L3 and L5 literally share a
carbocation intermediate; L6 fuses everything into one decision. No lesson resets context.

---

## 2. How this was designed (the agent pipeline)

```
orchestrator (curriculum outline)
        │
        ├── Lesson 1 evaluator (Opus 4.8) ── generator subagent → 12 ideas → scored → winner
        ├── Lesson 2 evaluator (Opus 4.8) ── generator subagent → 12 ideas → scored → winner
        ├── …
        └── Lesson 6 evaluator (Opus 4.8) ── generator subagent → 12 ideas → scored → winner
```

Each evaluator was loaded with the full `PREFERENCES.md` philosophy, the Lesson-1
exemplar, the existing primitives, **and correct mechanism chemistry**, then scored every
generated idea 1–5 on ten criteria and kept the best:

> *teaches-not-decorates · discovery-first · watch-it-change · lightweight ·
> hides-the-answer · manipulation quality (real drag, mouse+touch) · aha/enjoyment ·
> feasibility (small SVG + pointer component) · **chemistry fidelity** (no misconceptions)*

The fidelity criterion did heavy lifting — it forced the interactions to make a
carbocation impossible in SN2/E2, mandatory in SN1/E1; to remove a **β**-hydrogen (not α)
in elimination; to require anti-periplanar geometry for E2 but not E1; and to keep
SN2 off 3° carbons and SN1 off methyl.

---

## 3. Lessons in detail

Each lesson's visual obeys the house rules: it shows **structure only — never the verdict**
(no pre-labeled "nucleophile/inversion/anti/Zaitsev", no pre-drawn product, no pre-plotted
energy minimum, no premature "correct"). The learner *produces* the mechanism by hand and
only then a gate confirms it, with Socratic answer-specific feedback on wrong tries.

### Lesson 1 — Curved Arrows: Nucleophiles & Electrophiles
- **Concept.** Reactions are electron pairs moving from electron-rich (lone pair, π bond,
  negative charge) to electron-poor (full/partial +, empty orbital). A double-barbed arrow's
  tail sits *on the electrons*, head *where the new bond forms*; if the target is already
  full, a second arrow must break a bond and a leaving group departs with its electrons.
- **The aha.** An arrow is electrons *moving* — and if the landing atom is already full,
  something has to leave.
- **Signature interaction — `MechanismCanvas`.** Drag a curved arrow; the tail snaps only to
  electron sources, the head to electrophilic sites; a ghost bond previews where it forms.
  An **octet/duet meter** on the target flares and blocks completion until the learner adds
  the second (bond-breaking) arrow — then the leaving group slides off with a "−". Illegal
  tails (on a "+" or a bare atom) are rejected: "arrows start on electrons."
- **Steps.** (1) NH₃ + H⁺ → one arrow into the empty orbital. (2) NH₃ + H–Cl → the duet meter
  forces a second arrow; Cl⁻ leaves. (3) OH⁻ + CH₃Br → the octet meter on carbon forces the
  C–Br arrow (quietly previews SN2). (4) rule. (5) teach-back: arrows for CH₃O⁻ + H–Br.
  (6) cold: F⁻ + BF₃ (one arrow, no leaving group) and H₂O + H–Br (two arrows).
- **This is the course's through-line** — every later mechanism is arrows on this canvas.

### Lesson 2 — SN2: Backside Attack & Inversion
- **Concept.** One concerted step: the nucleophile attacks ~180° behind the leaving group;
  the Nu–C bond forms as the C–LG bond breaks; the other three groups invert like an umbrella;
  rate = k[Nu][substrate] (2nd order); sterics kill it (methyl > 1° > 2° ≫ 3°). No carbocation.
- **The aha.** There's only one way in — straight behind the leaving group — and shoving in
  turns the carbon inside-out in a single push; speed needs *both* partners and an open carbon.
- **Signature interaction — `ReactionStage`.** Drag the nucleophile around a tetrahedral
  carbon; front/side approaches deflect, only the backside bonds; on success the curved
  arrows fire, the bond forms *as* the LG leaves, and the three groups **umbrella-flip**
  (wedge↔dash). A one-hump energy curve co-draws (apex with partial bonds to both Nu and LG;
  **no** middle valley). A "leave-first" attempt fails (kills the carbocation misconception).
- **Steps.** (1) attack → which approach bonded / what the groups did. (2) concerted → "how
  many humps?" (1), "carbocation first?" (no). (3) rate lab → double both partners → ×4;
  tert-butyl won't react. (4) rule. (5) teach-back: OH⁻ + (R)-2-bromobutane stereochem.
  (6) cold: triple [Nu] & double [substrate] → ×6; (S)→R inverted.

### Lesson 3 — SN1: Carbocations & Racemization
- **Concept.** Stepwise: the leaving group leaves first → a planar (sp²) carbocation, then
  the nucleophile attacks **either face** → racemic (~50:50). Rate = k[substrate] (1st order,
  nucleophile-independent); stability 3° > 2° > 1° > methyl. SN2's mirror image.
- **The aha.** Leave it alone and the carbon collapses flat — so the nucleophile hits either
  side and you get **both** mirror images; piling on more nucleophile does nothing.
- **Signature interaction — `MechanismCanvas` (two phases) + `RateLab`.** Drag the leaving
  group out → the carbon flattens to 120° with empty-p lobes; a 2-hump energy trace draws
  (hump → well). Then drag the nucleophile to the **top** lobe (one molecule) and the
  **bottom** lobe (the next) → an R/S scoreboard lands ~50:50. The `RateLab` ranks substrate
  classes and shows that adding nucleophile changes the rate by ×1 (first order).
- **Steps.** (1) ionize → shape (trigonal planar), angle (120). (2) attack either face →
  "2 products?" / "racemic?" (callback: SN2 gave one inverted product). (3) rate lab →
  fastest = 3°; double [Nu] → ×1. (4) rule (overlays the 2-hump profile, first hump = RDS).
  (5) teach-back: (R)-3-bromo-3-methylhexane racemization. (6) cold: optical rotation → 0;
  double [Nu] → ×1. **Hands the carbocation straight to E1.**

### Lesson 4 — E2: Anti-Periplanar Elimination
- **Concept.** One concerted, bimolecular step: a strong base removes a **β**-hydrogen as the
  leaving group departs and a C=C forms — three arrows at once. Requires the β-H and LG
  **anti-periplanar (~180°)**. Zaitsev (more-substituted alkene) major, unless a bulky base
  gives the Hofmann (less-substituted) product. No carbocation.
- **The aha.** It only reacts when the H is lined up *opposite* the leaving group — and it all
  snaps at once; which H the base grabs decides which alkene you get.
- **Signature interaction — `NewmanEliminate`.** Sight down the Cα–Cβ bond; **drag the back
  carbon** to rotate. Away from anti, the base leans in but is rejected ("needs to be anti");
  when a β-H crosses the anti window the axis glows and **three arrows fire simultaneously**,
  ejecting the LG and snapping to the flat alkene. A bulky-base toggle flips Zaitsev→Hofmann.
- **Steps.** (1) rotate-to-anti & fire → anti angle (180), bonds changing at once (3).
  (2) Zaitsev pick (small base) → more-substituted major. (3) bulky-base twist → less-
  substituted major. (4) rule. (5) teach-back: why 2-bromobutane + ethoxide → but-2-ene.
  (6) cold: a locked-gauche substrate can't do E2 (No); Zaitsev vs Hofmann by base size.
- **The Newman widget is reused by any later conformations content.**

### Lesson 5 — E1: Carbocation Elimination
- **Concept.** Stepwise, shares SN1's first step: LG leaves → carbocation (RDS, rate =
  k[substrate]), then a weak base removes a β-H → alkene. SN1 and E1 **compete** off the
  same cation (attack C = substitution; take a β-H = elimination); stable cation, weak base,
  protic solvent, and **heat** favor E1; Zaitsev major.
- **The aha.** E1 *is* SN1 until the second arrow — one cation, two fates; crank the heat and
  the fork tips toward the alkene.
- **Signature interaction — `MechanismCanvas` "Carbocation Fork".** Act 1: drag the C–Br
  arrow → the shared planar cation (the *same* first hump SN1 drew). Act 2: drag a second
  arrow to the **cationic carbon** (→ SN1 product) or a **β-H** (→ alkene); both products
  render under the one cation (casework view). A **heat slider** tips the balance toward
  elimination; step 3 lets the learner pluck each distinct β-H (Zaitsev).
- **Steps.** (1) ionize → "which reaction began with this step?" (SN1). (2) fork + heat →
  "β-H gives a…?" (alkene), "both from the same…?" (carbocation), "heat favors…?"
  (elimination). (3) Zaitsev → more-substituted major. (4) rule. (5) teach-back: hot
  2-bromo-2-methylbutane in ethanol. (6) cold: swap to a strong bulky base → E2; double
  [base] → rate ×1. **This lesson unifies the substitution/elimination competition.**

### Lesson 6 — Choosing the Pathway (SN1/SN2/E1/E2)
- **Concept.** Given a substrate + conditions, predict the dominant mechanism (and product)
  by weighing four factors: substrate class, nucleophile/base strength + bulk, solvent, and
  temperature.
- **The aha.** The same C–X bond can become four different things — you don't memorize four
  mechanisms, you weigh four knobs; flip one knob and the verdict flips.
- **Signature interaction — `ReactionConsole`.** A bench with four progressively-unlocked
  controls: a **substrate dial** (redraws the skeleton), a **draggable reagent bottle**, a
  **solvent toggle**, and a **heat lever**. The verdict badge + product stay a "?" until the
  learner commits a prediction; only then do they animate in and the **deciding knob** gets a
  brief highlight. A repurposed tap-to-grow **`MechanismTree`** *names* the framework at the
  rule step (console derives; tree crystallizes).
- **Steps.** (1) substrate filter → on 1°, SN1 & E1 impossible → must be SN2/E2. (2) same 2°
  substrate, swap bottles head-to-head → SN2 (NaCN/aprotic) vs E2 (NaOEt/hot). (3) weak
  reagent on 3° + solvent/heat → SN1 cool vs E1 hot. (4) rule (the decision tree, SN2 branch
  pruned on 3°). (5) teach-back: 2-bromobutane + NaSH/acetone → SN2. (6) cold: 3° + KOtBu/heat
  → E2 (isobutylene); design-backwards to get tert-butanol → weak Nu/protic/cool → SN1.

---

## 4. New components & shared engine additions

The big win: a **curved-arrow canvas is the spine** of L1, L3, and L5, and an **energy-trace**
overlay + a **shared carbocation intermediate** recur across L2/L3/L5. Build the canvas once;
those lessons become mostly data.

| Visual | Powers | Mechanic |
|--------|--------|----------|
| `MechanismCanvas` | L1, L3, L5 | draggable double-barbed arrows; snap-to-electrons; octet/duet meter; leaving-group ejection; optional energy-trace + carbocation-fork modes |
| `ReactionStage` | L2 | tetrahedral center; backside-only Nu drag; umbrella inversion; 1-hump trace |
| `NewmanEliminate` | L4 (+ future conformations) | rotate the back carbon to anti-periplanar; fire 3 concerted arrows |
| `RateLab` | L3 (reusable) | rank substrate classes; concentration sliders → reaction order |
| `ReactionConsole` | L6 | dial substrate/reagent/solvent/heat → verdict + product (withheld until commit) |
| `MechanismTree` | L6 | tap-to-grow decision tree (asymmetric, labeled, prunable extension of the existing `tree-build`) |
| `EnergyTrace` | L2, L3, L5 | shared sub-component: 1-hump (concerted) or 2-hump-with-well (stepwise), drawn as the learner acts |

All are lightweight schematic SVG + pointer events (mouse **and** touch via
`setPointerCapture` + `touch-action:none`), built on the proven `HandshakeConnect`
(drag/snap/rubber-band) and `RoundTable` (rotation) patterns — **no chemistry engine**;
atoms/bonds/sites and the correct arrow set are predefined data.

**Shared additions to the lesson engine (small, reused across every lesson):**

1. **`ChoiceBlank`** — a categorical gate (prompt + options + correctId + Socratic
   per-choice `feedbackWrong`). Chemistry answers aren't numbers, so this is needed in *every*
   lesson. (Same primitive the stats course design also calls for — build it once.)
2. **`manipulateFirst?`** — boolean on `discovery` so the widget renders *before* the gates
   (the learner draws the mechanism first; the gate only confirms). Needed by all six.
3. **Categorical `cold-problem` variant** — L6's final checks are "which mechanism / which
   product", not numbers.

```ts
// the broadly-shared new gate (reuses the existing Socratic FeedbackWrong shape)
export type ChoiceBlank = {
  id: string
  prompt: string
  options: { id: string; label: string }[]
  correctId: string
  feedbackWrong: { default: string; specificCases: { optionId: string; message: string }[] }
}

// the curved-arrow canvas: one DiscoveryVisual arm, mode-driven, drives L1/L3/L5
export type MechanismCanvasConfig = {
  mode: 'bond' | 'ionize' | 'attack' | 'fork'
  atoms: { id: string; el: 'C'|'H'|'O'|'N'|'Br'|'Cl'|'B'; x: number; y: number; charge?: -1|0|1; lonePairs?: number }[]
  bonds: { id: string; a: string; b: string; order: 1|2 }[]
  tails: { id: string; kind: 'lonePair'|'bond'; on: string; x: number; y: number }[]  // legal arrow starts
  heads: { id: string; kind: 'atom'|'emptyOrbital'; on: string; x: number; y: number }[] // legal ends
  solution: { tail: string; head: string }[]   // the 1–2 correct arrows
  shell: { H: 2; default: 8 }                   // duet vs octet meter
  leaving?: { atom: string; breakBond: string; becomes: -1 }
  energyTrace?: boolean                         // co-draw 1- or 2-hump profile
}
// DiscoveryVisual |= { component: 'mechanism-canvas'; config: MechanismCanvasConfig }
// DiscoveryStep   |= { manipulateFirst?: boolean; gates: (SolveBlank | ChoiceBlank)[] }
```

Most lessons reuse the existing `discovery` step (manipulable visual + gates) plus
`rule-statement` / `teach-back` / `cold-problem` verbatim — content stays data-driven and
renderers stay generic, per `PREFERENCES.md §7`.

---

## 5. Architecture: making room for a second course

The app is currently **single-course** (flat `lesson-1…6` ids in `src/content/course.ts` +
`src/content/lessons.ts`; the course title hardcoded in
`src/components/course/CoursePath.tsx`). Standing up this course needs the same foundation
the stats-course doc flags:

- **A course registry** — `{ id, slug, title, subjectLabel, lessonIds[] }`; move the hardcoded
  "Counting Strategies" strings into it.
- **Namespaced lesson ids** — e.g. `rxn-1`…`rxn-6` (keeps progress keys, tests, and e2e routes
  from colliding).
- **Routing** — `/course/:courseId` and a course picker on the landing page.
- **Per-course progress** — namespacing the ids covers the storage key; scope the path UI to
  one course.
- **Disable the math operator-unlock** — `AllowedOpsContext` (the `+ − × ! P C` ladder tied to
  `lesson.order`) is combinatorics-specific and irrelevant here; make it course-scoped/off.

This is the one **prerequisite workstream**; the lesson content is otherwise pure data.

---

## 6. Suggested build order

1. **Multi-course foundation (§5)** — registry, namespaced ids, `/course/:courseId`, picker.
2. **Shared engine bits (§4)** — `ChoiceBlank`, `manipulateFirst`, categorical cold-problem.
3. **`MechanismCanvas` + `EnergyTrace` first** — the highest-leverage components; they unlock
   L1, L3, and L5 together.
4. **Lessons in dependency order:** L1 (canvas) → L2 (`ReactionStage`) → L3 (canvas + `RateLab`)
   → L4 (`NewmanEliminate`) → L5 (canvas fork) → L6 (`ReactionConsole` + `MechanismTree`).
   `ReactionStage`, `NewmanEliminate`, and `ReactionConsole` are independent and can be built
   in parallel (one focused agent per component, per `PREFERENCES.md §7`).
5. **Per-lesson Playwright e2e** with mid-gesture screenshots (the backside attack + umbrella
   flip, the rotate-to-anti fire, the carbocation fork, the console verdict reveal) — eyeball
   affordances, not just asserts.
6. Keep typecheck / lint / unit / build green throughout.

---

## 7. Open decisions for you

- **Scope of the unit** — I chose the **SN1/SN2/E1/E2** family because it's the most
  mechanism-dense, self-reinforcing (they compete), and interaction-rich block in a first
  orgo course. If you want it broader/different (e.g. add **electrophilic addition to alkenes**
  — Markovnikov, halogenation, hydration — as L6/L7, or swap the capstone), say so and I'll
  re-run the pipeline.
- **Prereqs** — this unit assumes a little structure literacy (Lewis structures, wedge/dash,
  what a stereocenter is). We could ship a short "structure primer" course before it, or fold
  a 30-second refresher into L1–L2.
- **This pass is design only.** Next step is implementation; confirm and I'll start with the
  multi-course foundation + the `MechanismCanvas`, then Lesson 1.
```

