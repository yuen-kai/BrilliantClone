# Lesson Audit & Proposed Changes

> **STATUS: implemented.** Legacy cleanup + lesson-id/order alignment (ids now
> match position), the reorder (Casework → Complementary), the voice pass, the
> honesty pass (no answer-revealing arithmetic in `ComplementDots`/`StarsBars`),
> the de-clutter (enumeration sidebars removed), and the interaction pass
> (`ComplementDots` direct/complement toggle, draggable `StarsBars`, new
> `CaseBins` combine visual, L2 dedup-scaffold harmonization) are all done.
> Verified: typecheck, lint, 82 unit tests, build, and Playwright e2e (Lesson 3
> walkthrough + Lesson 4/5 visuals) all green, with screenshots reviewed.

Every lesson audited against `docs/PREFERENCES.md`.

Priority: **P1** = clear violation of the doc · **P2** = meaningful improvement ·
**P3** = nice-to-have. Effort: **S/M/L**.

> **Approved with changes (this revision):**
> - Dropped "drag the racers" for L2 — not helpful.
> - L3 enumeration sidebars to be **removed**: too many arrangements to enumerate
>   usefully, and they add clutter (per the updated §4 / "avoid tedious" rule).
> - L4 reworked around a **direct ↔ complementary toggle** that shows the count
>   change, instead of crossing out dots by hand.
> - **Lesson reorder:** Casework moves **before** Complementary Counting.

---

## Cross-cutting (apply to all/most lessons)

- [ ] **X0 · Reorder: Casework before Complementary Counting. (P1, S)**
  New path: 1 Multiplication · 2 Perms & Combos · 3 Overcounting · **4 Casework** ·
  **5 Complementary Counting** · 6 Stars and Bars. Rationale: casework teaches
  "count the cases," which complementary counting then leans on (direct = sum of
  cases; complementary = total − unwanted), and it sets up the L5 toggle below.
  **Proposed mechanics:** keep lesson **IDs stable** (`lesson-4` stays
  Complementary, `lesson-5` stays Casework) and only swap each lesson's `order` +
  `prerequisiteLessonId` and the `course.ts` list order, so saved progress, tests,
  and e2e routes don't break. (The id-number no longer matches display order —
  acceptable; flag if you'd rather rename ids.)
- [ ] **X1 · Trim prompts to one short line; remove pre-narration. (P1, M)**
  Most prompts are 2–3 sentences that tell the learner what to do and often the
  method. Cut to a single scenario line and let the interaction carry the rest.
- [ ] **X2 · Visuals must never show the final arithmetic. (P1, M)**
  `ComplementDots` prints `8 − 1 = 7`; `StarsBars` shows the running distribution.
  Per §4 the visual shows *structure only*; the number is the learner's job.
- [ ] **X3 · Prefer manipulation over number entry. (P2, L)**
  Several steps are pure type-the-number. Where a visual exists, make the visual
  the input and let numeric gates only *confirm* (§2).
- [ ] **X4 · Harmonize the "divide out repeats" scaffold across L2/L3/L6. (P2, M)**
  L2 (combinations), L3 (overcounting), and L6 (identical bars) all divide out
  repeats but use different language. Unify on the L3 "ignoring repeats →
  considering repeats" template so the family compounds.
- [ ] **X5 · Add Playwright interaction + screenshot tests per lesson. (P2, M)**
  Mirror the L3 e2e: drive the real gestures, capture mid-gesture frames, eyeball
  the affordances (§6).

---

## Lesson 1 — Multiplication Principle  (`visual-interactive`, tree)

Solid foundation; mostly voice + verbosity.

- [ ] **L1-a · Trim the three step prompts to one line each. (P1, S)**
  Drop "Build the decision tree and find how many…"; e.g. "2 breads, 3 meats,
  2 cheeses — how many sandwiches?"
- [ ] **L1-b · Remove the planted insight in step 3. (P1, S)**
  Prompt currently says "notice the first two levels repeat the same branch
  count" — that hands over the very thing they should notice.
- [ ] **L1-c · Reduce per-level number entry. (P2, M)**
  Counting nodes at every level on every step gets repetitive by step 3; consider
  asking the running count only once and letting later splits be tap-to-grow (§3).

## Lesson 2 — Permutations & Combinations  (`slot-select`)

Closest cousin to L3 — should share its scaffold.

- ~~L2-a · Drag racers into slots~~ — **dropped** (not helpful; the existing
  spin/select animation is fine).
- [ ] **L2-b · Adopt the L3 dedup scaffold for the combination steps. (P2, M)**
  Re-label "If order counted / Orders of your group / Ways to choose" toward the
  shared "ignoring repeats → considering repeats" template, with progressive
  disclosure (reveal the divide only after the ordered count). (§3, §4)
- ~~L2-c · Enumeration panel for the combination dedup~~ — **dropped** (consistent
  with removing panels elsewhere; the ordered space is large).
- [ ] **L2-d · Trim multi-sentence prompts. (P1, S)**

## Lesson 3 — Overcounting  (`discovery`)

- [ ] **L3-a · Remove the enumeration sidebars from all three widgets. (P1, M)**
  Too many arrangements to enumerate usefully (round table = 120) and they clutter
  the step. Keep the manipulable widget + the two gates ("ignoring repeats →
  considering repeats"); drop the `showOptions` panels and the `gateIndex`-driven
  reveal of them. (Also simplifies the `DiscoveryStep`/widget props.)
- [ ] **L3-b · Re-verify with e2e + mid-drag screenshots after the sidebars go. (P1, M)**
  (Resolves the round-table-empty issue seen in the last run as a side effect.)

## Casework  (new position 4 · id `lesson-5`; `visual-interactive` trees + `guided-solve`)

Now comes *before* complementary counting and seeds the "count the cases" idea.

- [ ] **L5-a · Stop pre-stating the rule. (P1, S)**
  Step 3 intro "Multiply WITHIN a case … To merge separate cases, ADD" gives away
  the lesson before the rule step. Let add-vs-multiply be discovered.
- [ ] **L5-b · Give the combine step a visual. (P2, M)**
  Step 3 is number-only. Show the two case-groups as disjoint bins merging into
  one pile so "add across cases" is something they see (§2/§4).
- [ ] **L5-c · Trim the two-sentence case prompts. (P1, S)**

## Complementary Counting  (new position 5 · id `lesson-4`; `visual-interactive` + `complement-dots`)

- [ ] **L4-a · `ComplementDots` must stop printing `total − unwanted = wanted`. (P1, S)**
  Show dots only; the subtraction is the gated answer (§4 / X2).
- [ ] **L4-b · Replace hand-crossing with a direct ↔ complementary toggle. (P2, M)**
  A single toggle flips the visual between the **direct** view (count the wanted
  cases — visibly many) and the **complementary** view (total minus the few
  unwanted), showing how the number of cases you must handle drops. That *is* the
  insight, without tediously marking outcomes. Builds naturally on Casework's
  "count the cases." (§2 lightweight-interaction / §4)
- [ ] **L4-c · Trim prompts/intros (step 2/3 each have prompt + intro restating
  the method). (P1, S)**

## Lesson 6 — Stars and Bars  (`guided-solve` + `stars-bars`)

Worst offender on text + pre-narration; biggest interaction upside.

- [ ] **L6-a · Make `stars-bars` draggable: the learner drags the bars through the
  row to form different sharings and sees each arrangement = one distribution. (P2, L)**
  Matches the §4 partitions example; today it only auto-randomizes.
- [ ] **L6-b · Heavily cut the prompts; remove "Here's the magic…" narration. (P1, M)**
  The star/bar equivalence should be discovered by dragging, not narrated.
- [ ] **L6-c · `stars-bars` shouldn't display group counts that telegraph the
  setup; keep it structural. (P2, S)** (X2)
- ~~L6-d · Enumeration panel of bar placements~~ — **dropped** (panels removed
  app-wide per the updated rule).

---

## Suggested order

1. **Reorder (P1):** X0 — Casework before Complementary (small, do first so later
   edits land on the final structure).
2. **Voice pass (P1, low-risk):** X1, L1-a/b, L2-d, L4-c, L5-a/c, L6-b.
3. **Honesty pass (P1):** X2 → L4-a, L6-c.
4. **De-clutter (P1):** L3-a — remove the enumeration sidebars.
5. **Interaction pass (P2):** L4-b (toggle), L5-b, L6-a, L2-b, then X4 harmonization.
6. **Verification (P1/P2):** L3-b, X5 e2e + screenshots across lessons.
