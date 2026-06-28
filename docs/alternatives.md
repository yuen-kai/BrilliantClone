# Decision log

> The repo's running record of meaningful choices. Each entry is **Chose →
> Considered (why rejected) → Gaps / risks**, with a stable id. Append only:
> when a choice changes, add a new entry and mark the old one `superseded by
> D-…`, never rewrite it. This log is the source of current truth alongside
> `AGENTS.md`; where a frozen PRD or spec conflicts with a later entry here, the
> entry wins.

## Section index

| Cluster | Range | Feature | Spec |
| --- | --- | --- | --- |
| D-RR | D-RR1 … D-RR12 | Review & Retention layer | [`spec-review-retention.md`](spec-review-retention.md) |

---

## D-RR: Review and Retention layer

Seeded by `iris-plan` before implementation. Companion docs:
[`prd-review-retention.md`](prd-review-retention.md),
[`spec-review-retention.md`](spec-review-retention.md).

### D-RR1: Which learning-science levers ship in this layer

- **Status:** resolved
- **Chose:** all four high-value gaps as one layer: spaced retrieval of
  mastered concepts, interleaving across a course's strategies, a durable
  per-concept retention model, and a pretest opener on each lesson.
- **Considered:** (a) spacing only, smallest slice but leaves the "learning vs
  performance" gap unaddressed and wastes the shared data spine; (b) the three
  retrieval levers and defer the pretest, clean but drops a cheap, well-evidenced
  opener the discovery lessons are already close to.
- **Gaps / risks:** the pretest adds a step type and one authored opener per
  lesson (18 lessons); larger surface area to build and test than a spacing-only
  slice. Mitigated by phasing (see spec §14).

### D-RR2: Scheduling model

- **Status:** resolved
- **Chose:** a per-concept interval ladder (Leitner-style boxes) with growing
  absolute intervals; a correct review promotes a concept one box, a miss demotes
  it.
- **Considered:** (a) SM-2 / FSRS per-item ease factors, more precise but heavy
  to implement, tune, and explain for a six-lesson course; (b) a fixed cumulative
  cadence (re-quiz everything weekly/monthly per Rosenshine), simple but ignores
  which concepts a learner actually struggles with.
- **Gaps / risks:** the ladder is not personalized to item difficulty; constants
  are a starting guess (see D-RR3). Revisit once there is real review telemetry.

### D-RR3: Interval constants

- **Status:** resolved
- **Chose:** box intervals of 1, 3, 7, 21, 60 days; a concept enters at box 0 the
  day after it is mastered (first gap ≥ 1 day so the first recall is effortful).
- **Considered:** shorter first gaps (hours), which make the first recall easy and
  teach little; pure expanding-only schedules presented as inherently superior.
- **Gaps / risks:** tuned for a multi-week horizon; the evidence says overshooting
  the gap costs less than undershooting, so err long. Grounding: Cepeda et al.
  (2008) put the optimal gap near 10 to 20% of the retention interval (about 1,
  11, 21 days for 1-week, 5-week, 10-week horizons); Karpicke & Roediger (2007)
  and Karpicke & Bauernschmidt (2011) found the *relative* schedule (expanding vs
  equal) barely matters, what matters is real spacing and a delayed first
  retrieval (up to a 200% retention gain from spacing alone).

### D-RR4: Where review questions come from

- **Status:** resolved
- **Chose:** reuse and expand the existing course-test bank (`courseTests.ts`),
  tagging each question with the concept (lesson) it draws from; reviews are
  generate-then-check with feedback.
- **Considered:** (a) replay shortened lesson cold-problems, but those are tied to
  one scenario and re-narrate; (b) AI-generate fresh items via a Cloud Function,
  more variety but adds cost, a quality-control surface, and a cognitive-debt risk
  if it leaks answers.
- **Gaps / risks:** the bank is small (6 to 7 items per course), so concepts will
  repeat quickly; the layer needs more items per concept before daily review feels
  fresh (see spec §10, §14). AI generation stays on the roadmap, not in this
  phase.

### D-RR5: Where review lives in the app

- **Status:** resolved
- **Chose:** a cross-course "Due for review" queue on the Course Hub, tied to the
  daily streak, that surfaces concepts as they come due.
- **Considered:** (a) per-course only, evolving the existing course-test node into
  a recurring review, but that buries review one level deep and fragments the
  daily habit; (b) both a global queue and per-course nodes, more surface than the
  habit needs at this phase.
- **Gaps / risks:** a single cross-course queue must not interleave across
  domains (counting vs chemistry). The queue groups and orders by course so
  interleaving stays within a domain (see D-RR7).

### D-RR6: Mastery vs retention semantics

- **Status:** resolved
- **Chose:** add a separate per-concept retention record (box, due date, lapses)
  distinct from the existing `mastered` flag. `mastered` keeps its current meaning
  (competence reached once, drives prerequisite gating); retention captures the
  durable, decaying thing and drives what is due.
- **Considered:** (a) make `mastered` itself lapse to "review due", but lesson
  unlock gating reads `mastered`, so lapsing it would re-lock downstream lessons,
  a bad outcome; (b) no decay model, fixed dates only, which cannot represent a
  learner who is falling behind on one concept.
- **Gaps / risks:** two states (mastered, retention) must stay coherent in the UI
  so a learner is not confused about what "done" means. PRD §UX and §edge cases
  own this.

### D-RR7: Interleaving scope

- **Status:** resolved
- **Chose:** interleave strategy types within a single course/domain only; never
  mix counting with chemistry in one review session.
- **Considered:** a fully shuffled cross-course session, simpler to assemble but
  contrary to the evidence.
- **Gaps / risks:** the daily queue spanning multiple courses must segment by
  course. Grounding: interleaving aids learning by training *discrimination*
  (which strategy a problem needs) within a domain (Rohrer & Taylor 2007; Rohrer
  et al. 2014, about 72% vs 38% on a delayed test); mixing unrelated domains just
  splits attention (Hendrick; Dunlosky et al. 2013).

### D-RR8: Pretest mechanic

- **Status:** resolved
- **Chose:** a `pretest` lesson opener: one prediction (a guess), the correct
  answer revealed immediately, then the normal lesson proceeds. The guess is not
  gated; a wrong or blind guess is fine.
- **Considered:** skipping it (loses the prequestion benefit); making the opener a
  graded gate (turns a low-stakes guess into a wall and risks discovery-learning
  failure modes).
- **Gaps / risks:** the benefit is targeted to the pretested idea and can come at
  the expense of un-pretested adjacent material, so the lesson must still teach
  everything. The immediate reveal is the active ingredient; without it the guess
  decays into an uncorrected error. Grounding: Kornell, Hays & Bjork (2009) (even
  guaranteed-wrong guesses potentiate later learning); Pashler et al. (2007)
  prequestions; Hendrick (pretrieval).

### D-RR9: Retention data model and location

- **Status:** resolved
- **Chose:** a new per-concept subcollection `users/{uid}/retention/{conceptId}`,
  one document per concept, holding the schedule state. Concept id is the lesson
  id for this phase (one concept per lesson).
- **Considered:** widening the shared `LessonProgress` type with schedule fields,
  but progress is per lesson and would conflate "where I am in the lesson" with
  "when this concept is due", and complicate the existing course-test piggyback.
- **Gaps / risks:** assembling the due queue reads the whole subcollection per
  user; fine at this scale (≤ 18 concepts), revisit if concept count grows.
  Mirrors the existing `localStorage` fallback used when Firebase is off.

### D-RR10: Honesty and cognitive-debt guardrails

- **Status:** resolved
- **Chose:** reviews always require the learner to generate the answer before any
  reveal, and always give feedback after; no item shows its answer first. When
  Firebase or AI is off, the layer degrades honestly (queue still works from local
  state; no fake items).
- **Considered:** showing the worked solution alongside the prompt as a "refresher"
  (turns retrieval back into rereading, the exact lethal mutation to avoid).
- **Gaps / risks:** none material. Grounding: quizzing with feedback is rated
  STRONG and "quizzing without feedback backfires" (Pashler et al. 2007);
  retrieval, not review-by-reading, is the learning event (Roediger & Karpicke
  2006; Hendrick on cognitive debt).

### D-RR11: Relationship to the existing course test

- **Status:** resolved
- **Chose:** keep the course test as the course-level capstone (its
  `primed → retest → reinforced` loop stays). The new per-concept layer is finer
  grained and feeds the daily queue; passing the course test seeds or refreshes
  the retention records for the concepts it covered.
- **Considered:** replacing the course test with the new layer, but the capstone
  is a distinct, motivating milestone and is already built and tested.
- **Gaps / risks:** two spacing mechanics coexist; the daily queue must not
  double-surface a concept the course test just reinforced on the same day. Spec
  §5 owns the de-duplication rule.

### D-RR12: Planning-doc filenames

- **Status:** resolved
- **Chose:** lowercase-hyphen planning-doc names (`prd-…`, `spec-…`,
  `alternatives.md`) from the `iris-plan` house style.
- **Considered:** the repo's existing `SCREAMING_SNAKE` doc names
  (`PREFERENCES.md`, `LESSON_AUDIT.md`), but those are content/reference docs, a
  different category; the repo has no prior planning-doc pattern to mirror.
- **Gaps / risks:** minor visual inconsistency with the content docs in `docs/`.

---

<sub>Created with the `iris-plan` skill by Iris Cai · maintained with `iris-log`.</sub>
