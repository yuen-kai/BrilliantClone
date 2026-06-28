# Course Design — "Exploring Distributions" (AP Statistics · Unit 1)

> **Status: design proposal (not yet built).** This is the course-details doc for a
> proposed *second* course. It was produced by outlining the curriculum, then running
> one **evaluator agent per lesson** (Opus 4.8) — each of which spawned its own
> **generator agent** (12 interaction ideas per lesson, 72 total), scored them against
> a rubric distilled from `docs/PREFERENCES.md`, and returned the winning interaction.
> Every interaction below is the survivor of that bake-off, with feasibility grounded
> in the existing data-driven lesson engine.

The existing course is combinatorics ("Counting Strategies", `AP Statistics · Combinatorics`).
This new course covers **Exploring One-Variable Data** — the most visual unit in AP
Stats, where every concept has an obvious "watch it change as you act" interaction.

---

## 1. The course at a glance

**Title:** Exploring Distributions
**Subject string:** `AP Statistics · Exploring One-Variable Data`
**Lessons:** 6, each following the proven Lesson-1 arc:
*3 hands-on discovery steps → name the rule → teach-back → cold problem.*

| # | Lesson | Big idea | Signature gesture | New visual |
|---|--------|----------|-------------------|------------|
| 1 | **Shape of Data** | A distribution is a pile-up; shape = its silhouette (skew/modes) | Drag raw values onto a number line → live histogram; bin-width slider | `DataDrop` |
| 2 | **Center: Mean vs Median** | Mean = balance point; median = middle; robustness | Drag a fulcrum level, then drag an outlier and watch the mean chase it | `BalanceLine` |
| 3 | **Spread** | Range, IQR, SD as *typical distance from the mean* | Drag dots apart; per-point distance² squares; drag one outlier | `SpreadLine` |
| 4 | **Boxplots & Outliers** | 5-number summary = four equal-*count* quarters; 1.5×IQR fence | Drag quartile dividers (box inflates); drag a point past the fence | `BoxplotStrip` |
| 5 | **Normal Curve & Empirical Rule** | μ shifts, σ stretches (area=1); 68–95–99.7 | Slide the bell, pinch its bends, sweep fences to ±1/2/3σ | `NormalBell` |
| 6 | **Z-Scores & Standardizing** | z = (x−μ)/σ; compare across distributions | Drag a value, count σ-hops; collapse two distributions onto one z-axis | `Standardizer` |

The arc is deliberately cumulative: **shape → center → spread → (boxplot uses spread's
IQR) → normal model → standardized comparison (uses the normal percentiles)**. No lesson
resets context; each adds one new twist.

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
exemplar, and the existing interaction primitives, then scored every generated idea
1–5 on nine criteria and kept the best:

> *teaches-not-decorates · discovery-first · watch-it-change · lightweight ·
> hides-the-answer · manipulation quality (real drag, mouse+touch) · aha/enjoyment ·
> feasibility (small SVG + pointer component) · concept fidelity (no misconceptions)*

The "hides-the-answer" and "concept fidelity" criteria did real work — e.g. they kept
standard deviation as **root-mean-square distance** (squares as literal area) rather than
letting it drift into "average distance", and kept boxplot quarters split by **count, not
width**.

---

## 3. Lessons in detail

Each lesson's visual obeys the house rules: it shows **structure only — never a computed
number** (no "x of N", no printed mean/σ/%); the learner reads positions off the axis and
types the number into a gate, which gives Socratic, answer-specific feedback on wrong tries.

### Lesson 1 — Shape of Data
- **Concept.** A distribution shows how often each value occurs; *shape* is the big-picture
  read — symmetric vs skewed (named by the long tail), unimodal vs bimodal, uniform, gaps —
  and bin width changes how a histogram looks without changing the data.
- **The aha.** Tall bars are just where values piled up; the **tail direction** names the
  skew, not where the peak sits.
- **Signature interaction — `DataDrop`.** Drag raw value-tokens from a tray onto a number
  line; each snaps to its tick and *rises into the bar over its bin* as you drop it. A
  bin-width slider merges/splits bars live, so a hidden second peak appears at narrow widths
  and blurs into one lump at wide widths. Remove the dragging and there is no distribution to
  read — the gesture *is* the construction.
- **Steps.**
  1. `dist-build (drop)` — "Drop each player's goals onto the line." → build a roughly
     symmetric pile. *Gates:* shape (symmetric); tallest bar over which value.
  2. `dist-build (deform)` — "Drag a few values way out to the right." → a long tail opens.
     *Gates:* shape (skewed right); tail points toward high; peak still near 5 (forces tail≠peak).
  3. `dist-build (rebin)` — "Same data. Slide to re-bin." → bimodal data; *Gates:* peaks at
     narrowest width (2) vs widest (1); did the data change? (no).
  4. `rule-statement` — names symmetric/skewed (by tail), unimodal/bimodal (count peaks),
     uniform, gaps; bin width changes appearance only.
  5. `teach-back` — "Describe the shape of this sleep-hours dotplot."
  6. `cold-problem` — (a) name a right-skewed home-price histogram → *skewed right*;
     (b) count clusters in a gapped bus-arrival dotplot → *2*.
- **Build.** New visual `DataDrop` (sibling of the discovery widgets: manipulable visual +
  gated blanks). One genuinely new shared field: a **categorical `shapeGate`** (multiple
  choice), since gates are numeric-only today.

### Lesson 2 — Center: Mean vs Median
- **Concept.** The mean is the balance point (sum ÷ n); the median is the middle value. An
  outlier or skew pulls the mean toward the tail while the median barely moves; report the
  median for skewed/outlier data, the mean for roughly symmetric data.
- **The aha.** Drag one point into the tail and the balance point slides out to chase it,
  while the middle marker doesn't flinch.
- **Signature interaction — `BalanceLine`.** A number line on a beam that physically *tips*
  around a draggable fulcrum; it snaps level only at the true mean. A diamond marks the median
  the whole time. In "chase" mode the fulcrum auto-slides to track a dragged outlier while the
  diamond holds — the growing gap between fulcrum and diamond is the entire story.
- **Steps.**
  1. `discovery (balance)` — drag the fulcrum level on `[2,4,6,8,10]`. *Gates:* mean (6),
     median (6) — they coincide when symmetric.
  2. `discovery (chase)` — drag the outlier to the far end. *Gates:* new mean (8), new median
     (6). Core robustness aha.
  3. `discovery (rank)` — slide a point *past* a neighbor. *Gates:* median holds, then steps —
     distance alone doesn't move the median, but changing the order does (misconception guard).
  4. `rule-statement` — mean = balance point (sensitive); median = middle (resistant).
  5. `teach-back` — "6 salaries: 40,42,45,48,50,300 — which center is honest, and why?"
  6. `cold-problem` — (a) median of 80,90,95,100,540 → *95*; (b) typical home price among
     200k,210,220,230,900k → *220*.
- **Build.** New `discovery` visual `balance-line` rendered by the existing discovery step;
  one small shared flag `manipulateFirst?` so the widget appears *before* the first gate.

### Lesson 3 — Spread
- **Concept.** Variability = how far values typically fall from center. Range = max−min
  (fragile); IQR = Q3−Q1 = middle-50% width (resistant); SD = typical root-mean-square distance
  from the mean.
- **The aha.** Spread is its own knob, separate from center — and one runaway value hijacks the
  range but can't move the middle-50% box. Distance counts as **area** (twice as far hurts four
  times as much), so SD ≠ "average distance".
- **Signature interaction — `SpreadLine`.** Draggable dot cloud with a live mean line and
  toggleable overlays: each point grows a square whose **area = (distance to mean)²** (so
  dragging a dot twice as far visibly *quadruples* its square), a ±1 SD band that breathes, an
  elastic range bracket, and a draggable Q1/Q3 IQR box.
- **Steps.**
  1. `spread-explore (squares + sdBand)` — drag dots together/apart. *Gates:* stack all on the
     mean → spread 0; double a dot's distance → square ×4; read the ±1 SD band length.
  2. `spread-explore (iqrBox + fences)` — drag Q1/Q3 fences until equal counts spill out each
     side. *Gates:* equal counts; Q3−Q1.
  3. `spread-explore (all overlays, one draggable dot)` — drag one dot to the edge. *Gates:*
     which ruler stretched most (range); which didn't move (IQR box); new range.
  4. `rule-statement` — range (extremes only), IQR (middle 50%), SD (typical distance, ~0 when
     identical).
  5. `teach-back` — "Town of \$300k homes + one \$5M mansion — why is range misleading but IQR
     not?"
  6. `cold-problem` — (a) IQR of 70,72,74,76,100 → *17* (not the range 30); (b) which of two
     equal-mean classes has larger SD → *the spread-out one*.
- **Build.** New visual `SpreadLine` + a new step type `spread-explore` that copies the proven
  `visual-interactive` shape (staged gates + final gate). Adds a few `StageGate` kinds:
  `read-value`, `ratio`, `which-changed`. Datasets are rigged so any SD *length-read* lands on
  an integer.

### Lesson 4 — Boxplots & Outliers
- **Concept.** The five-number summary cuts ordered data into four equal-**count** quarters; the
  box spans Q1→Q3 (width = IQR) with the median inside; whiskers reach the last value within
  1.5·IQR; points beyond Q1−1.5·IQR or Q3+1.5·IQR are outliers.
- **The aha.** The four pieces are equal in *count*, not *width* — the box, the off-center
  median, and the short whiskers all show where the data crowds; "1.5 IQRs past the box" is a
  precise line a point must clear to be unusual.
- **Signature interaction — `BoxplotStrip`.** A dotplot strip with draggable dividers; dots
  reassign live and un-numbered tally bars grow under each region. When all four hold the same
  count they snap-glow and a **box + median + whiskers rise out of the strip**. In outlier mode,
  dragging the far dot stretches the whisker until it crosses a faint 1.5×IQR fence — the dot
  goes **hollow** (becomes a plotted outlier) and the whisker **snaps back**, while the box never
  moves (IQR resists — callback to Lesson 3).
- **Steps.**
  1. `discovery (place-quartiles)` — slide dividers so each chunk holds the same count (box
     inflates). *Gates:* count per chunk; the widest chunk still holds the same count.
  2. `discovery (balance-median)` — slide the median so equal counts sit each side; it locks
     off-center. *Gates:* dots inside the box (half); which edge the median sits nearer.
  3. `discovery (drag-outlier, fence)` — drag the far point out. *Gates:* distance from box edge
     to break point → in IQRs (1.5) → new whisker tip.
  4. `rule-statement` — 5-number summary, box=IQR, whiskers to last value within 1.5·IQR,
     outlier rule.
  5. `teach-back` — "Build the boxplot of 1,3,4,6,7,9,10,12,25 — is 25 an outlier?"
  6. `cold-problem` — (a) upper fence of …,38 → *26*, so 38 is an outlier; (b) how many of 40
     scores fall inside the box → *20* (the middle half).
- **Build.** New `discovery` visual `boxplot-strip`; reuses the discovery step + gates; one
  shared flag `interactionFirst?` (same need as Lesson 2's `manipulateFirst`).

### Lesson 5 — Normal Curve & Empirical Rule
- **Concept.** Many distributions are ≈ normal; μ sets the center, σ sets the width (taller↔
  narrower) while total area stays 1; ≈68% of data lies within ±1σ, ≈95% within ±2σ, ≈99.7%
  within ±3σ.
- **The aha.** A bell is pinned by just two knobs — where it sits and how wide it is — and no
  matter how you stretch it, the data packs the same way: ~⅔ in the first SD-step, almost all by
  the third.
- **Signature interaction — `NormalBell`.** One bell on a numbered axis, three drag modes:
  *shift* (grab the curve, slide μ), *reshape* (pinch the inflection "bend" points to set σ
  while an "area = 1" gauge stays pinned full), *shade* (drag mirrored fence handles that
  detent-snap to ±1/±2/±3σ; the band fills and an unlabeled area meter rises). No sliders — you
  grab the curve and its handles directly.
- **Steps.**
  1. `discovery (shift)` — slide the peak onto 80. *Gates:* center (80); spread unchanged (σ=6).
  2. `discovery (reshape)` — pinch the bends to σ=4 (taller/narrower). *Gates:* σ (4); total area
     (still 1).
  3. `discovery (shade)` — sweep fences out one SD at a time. *Gates (progressive):* within ±1σ
     (68) → ±2σ (95) → ±3σ (99.7).
  4. `rule-statement` — the 68–95–99.7 rule.
  5. `teach-back` — "SAT μ=1000, σ=200 — what % score 600–1400?" (±2σ → 95%).
  6. `cold-problem` — (a) heights μ=170,σ=10, % in 160–180 → *68*; (b) % taller than 190 → *2.5*
     (one-tail twist that primes z-scores).
- **Build.** New `discovery` visual `normal-bell` (the bell is an SVG path: `y=exp(-(x-μ)²/2σ²)`,
  peak height ∝ 1/σ so area reads constant; shading is a clipped area path). The 0.6827/0.9545/
  0.9973 constants only *size the meter*, never render as text. Optional `tolerance?` on the
  numeric gate so 99.7 is forgiving.

### Lesson 6 — Z-Scores & Standardizing
- **Concept.** z = (x−μ)/σ = how many SDs from the mean; standardizing rescales any value onto a
  common ruler so different distributions can be compared; sign = side of mean, |z| = how
  unusual; under a normal model z maps to a percentile (0→50th, ±1→84/16, ±2→97.5/2.5).
- **The aha.** "86 points and 92 points can't be compared — but *2 SDs above* and *1 SD above*
  can." Standardizing doesn't move anything; it relabels each position against its own ruler, so
  the bigger raw number isn't always more impressive.
- **Signature interaction — `Standardizer`.** Drag a marker on a raw axis (μ line + σ ticks);
  springy σ-hop arrows pop from μ, one per SD crossed (counting hops *is* (x−μ)/σ). A linked
  z-axis dot glides along; a normal curve shades the area left of the marker (percentile). In the
  capstone, two stacked distributions collapse onto one shared z-axis when you tap **Standardize**.
- **Steps.**
  1. `discovery` (1 distribution, z-axis hidden) — drag Maria's 86 (μ=70,σ=8). *Gates:* SDs from
     the mean (0 at μ, then 2).
  2. `discovery` (reveal z-axis + sign, then curve + shade) — drag Sam's 54. *Gates:* signed z
     (−2); percentile of the shaded area (~84).
  3. `discovery` (2 distributions, collapse) — Maria 86 (math) vs Liam 92 (history); tap
     Standardize. *Gates:* who's more impressive (Maria); each z (2 and 1).
  4. `rule-statement` — z = (x−μ)/σ; standardize to compare; z↔percentile.
  5. `teach-back` — "SAT 1350 (μ1050,σ200) vs ACT 30 (μ21,σ6) — who did better?" (both z=1.5 → a
     tie; forces the method).
  6. `cold-problem` — (a) z of a 210-min marathon (μ240,σ20) → *−1.5* (faster = negative);
     (b) the more impressive player's z among two leagues → *2.6*.
- **Build.** New `discovery` visual `standardizer`; reuses gates + KaTeX (`MathText`) for the
  formula; adds a small shared **`ChoiceBlank`** gate ("who did better?") — the same categorical
  gate Lesson 1 and Lesson 4 need.

---

## 4. New components & shared engine additions

Six new visuals, all the same shape as the existing widgets (a small SVG + pointer-events React
component, mouse **and** touch via `setPointerCapture` + `touch-action:none`, design tokens for
light/dark, structure-only with no answer leakage):

| Visual | Plugs into | Mechanic |
|--------|-----------|----------|
| `DataDrop` | new `dist-build` step | drag values → live histogram + bin slider |
| `BalanceLine` | `discovery` | tipping beam, drag fulcrum/outlier |
| `SpreadLine` | new `spread-explore` step | draggable cloud + distance² squares + IQR box |
| `BoxplotStrip` | `discovery` | drag quartile dividers / median / outlier |
| `NormalBell` | `discovery` | drag curve (μ) / pinch bends (σ) / sweep fences |
| `Standardizer` | `discovery` | raw-axis ↔ z-axis, collapse-to-compare |

**Shared additions to the lesson engine (small, reused across lessons):**

1. **`ChoiceBlank`** — a categorical gate (prompt + options + correctId + Socratic
   `feedbackWrong`). Needed by L1 (name the shape), L4 (which edge), L6 (who did better). Gates
   are numeric-only today; this is the one broadly-useful new primitive.
2. **`interactionFirst?` / `manipulateFirst?`** — a boolean on `discovery` so the widget renders
   *before* the gates (today gates render first). Needed by L2, L4, L5. Pick one name and reuse.
3. **Optional `tolerance?`** on `SolveBlank` (L5's 99.7). Trivial; or just store `99.7` with a
   Socratic case for `100`.
4. **Two new `StageGate` kinds** for L3's `spread-explore`: `read-value`, `ratio`,
   `which-changed`.

```ts
// the one genuinely shared new gate type
export type ChoiceBlank = {
  id: string
  prompt: string
  options: { id: string; label: string }[]
  correctId: string
  feedbackWrong: FeedbackWrong   // reuse existing Socratic shape
}

// example new discovery visual entry (each new widget is one union arm)
export type DiscoveryVisual =
  | /* …existing… */
  | { component: 'balance-line';  config: BalanceLineConfig }
  | { component: 'boxplot-strip'; config: BoxplotStripConfig }
  | { component: 'normal-bell';   config: NormalBellConfig }
  | { component: 'standardizer';  config: StandardizerConfig }
```

Two lessons (L1, L3) warrant their own step types because their gating differs from the
"explore-then-blanks" discovery flow; L2/L4/L5/L6 reuse `discovery` with a new visual. This keeps
content data-driven and the renderers generic, per `PREFERENCES.md §7`.

---

## 5. Architecture: making room for a *second* course

The app is currently **single-course** — there's no course registry, and lesson ids are flat
(`lesson-1`…`lesson-6`) in `src/content/course.ts` + `src/content/lessons.ts`, with the course
title hardcoded in `src/components/course/CoursePath.tsx`. Standing up a real second course needs:

- **A course registry** — `{ id, slug, title, subjectLabel, lessonIds[] }`; move the hardcoded
  "Counting Strategies" / "Combinatorics · Level 1" strings into it.
- **Namespaced lesson ids** — e.g. `dist-1`…`dist-6` (keeps progress keys, tests, and e2e routes
  from colliding with the combinatorics lessons).
- **Routing** — `/course/:courseId` and a course picker on the landing page (today one CTA →
  `/course`).
- **Per-course progress** — Firestore/localStorage is keyed by `lessonId` only; namespacing the
  ids covers this, but the course path UI needs to scope to one course.
- **Per-course feature rules** — the operator-unlock ladder (`AllowedOpsContext`) is tied to
  global `lesson.order`; this stats course needs none of the `!`/`P`/`C` unlocks, so make
  operator rules course-scoped (or just allow basic ops throughout).

This is the one **prerequisite workstream** before the lessons themselves; the lesson content is
otherwise pure data.

---

## 6. Suggested build order

1. **Multi-course foundation (§5)** — registry, namespaced ids, `/course/:courseId`, picker.
2. **Shared engine bits (§4)** — `ChoiceBlank`, `interactionFirst`, the `StageGate` kinds.
3. **Lessons in dependency order**, each = one visual + one data file:
   L1 `DataDrop` → L2 `BalanceLine` → L3 `SpreadLine` → L4 `BoxplotStrip` →
   L5 `NormalBell` → L6 `Standardizer`. Several visuals are independent and can be built in
   parallel (one focused agent per component, per `PREFERENCES.md §7`).
4. **Per-lesson Playwright e2e** with mid-gesture screenshots (drag the fulcrum, sweep the
   fences, collapse the z-axis) — eyeball affordances, not just asserts.
5. Keep typecheck / lint / unit / build green throughout.

---

## 7. Open decisions for you

- **Course topic** — I chose **Unit 1 (Exploring One-Variable Data)** as the most visual unit.
  Alternatives if you'd rather: Unit 2 (scatterplots/regression — drag a line to minimize
  residuals) or Unit 5 (sampling distributions/CLT — simulation-heavy). Say the word and I'll
  re-run the pipeline for a different unit.
- **Scope of this pass** — this doc is design only. Next step is implementation; confirm and I'll
  start with the multi-course foundation + Lesson 1.
- **6 vs fewer lessons** — the arc is tight at 6; we could ship L1–L3 first as a "Describing Data"
  mini-course and add L4–L6 later.
```

