# PRD — Combinatorics Strategies (AP Stats)

## App Description
A learn-by-doing web app that teaches AP Statistics combinatorics through interactive, hands-on lessons instead of videos or static text. Each lesson drops the student into a problem they manipulate directly, gives instant feedback, and only then states the underlying rule. Lessons are organized into a course path covering combinatorics problem-solving strategies, with progress, mastery, and streaks tracked per user across sessions and devices.

## Subject
AP Statistics — Combinatorics, taught as problem-solving *strategies* (not formulas). Course path: multiplication principle → permutations/combinations → overcounting → complementary counting → casework → stars and bars. This PRD covers Lesson 1 only.

## Persona
A student with no prior background in combinatorics — no assumed familiarity with counting formulas, notation (nCk, nPk), or terms like "permutation" or "combination." The lessons should build the strategies from scratch through interaction, not assume the student already has pieces to connect.

## MVP Scope
No AI. The product is the full system: a content model that drives any lesson, gated step-by-step progression, instant specific feedback, cross-device persistence, a course path with mastery tracking, and streaks. That system is fully built and working. Only one lesson is currently loaded into it — see **Lesson 1 Specification** below for its details.

- Auth (Firebase Auth) — name/account required
- Content model drives lesson rendering, gating, and feedback (see Content Model section)
- Progress persists mid-lesson, across devices (Firestore)
- Course path screen: locked/grayed future lessons, "recommended next" after completion
- Streak counter (consecutive days with a lesson started)
- Mobile responsive, touch-friendly drag/tap targets
- Performance: feedback <100ms, 60fps tree animation, <2s load to first interaction

## Lesson 1 Specification
Multiplication Principle, five steps, gated progression. This is the one lesson currently loaded into the system above.

### Step 1 — Build & count (gated)
- Problem: "2 breads, 3 meats, 2 cheeses — how many sandwiches?"
- Base node → tap Next → animated split into N children + "×N" label → input "how many nodes at this level?" → must be correct to advance (wrong → hint, retry)
- Repeat for each level (2 → 6 → 12)
- Reveal question: "how many total sandwiches?" — gated on 12. If answer is 7 (2+3+2), specific feedback referencing their own tree ("count full paths top-to-bottom, not options per level").

### Step 2 — Build & supply multiplier (gated)
- New problem: "3 crusts, 2 sizes, 3 toppings — how many pizzas?"
- At each split, two gated inputs: multiplier ("branches per node?") and running total ("total nodes at this level?")
- Reveal question gated on 18

### Step 3 — Padlock code, mixed option counts with a repeat (gated)
- New problem: "A padlock code has 2 letters (2 options each) followed by 1 digit (3 options) — how many codes?" Tree has 3 levels (letter 1, letter 2, digit), and the first two levels deliberately repeat the same branch count (2) so the student sees a repeated quantity isn't always added — it's still multiplied like any other level.
- Same tree-build + node-count gate as Steps 1–2 (single input per level: node count)
- Repeat for each level (2 → 4 → 12)
- Reveal question gated on 12

### Step 4 — Explicit rule
- Static, no interaction. State multiplication principle. Show Step 3 tree with "2 × 2 × 3 = 12" overlaid.

### Step 5 — Cold application (mastery signal)
- Problem A: "A combination lock uses a 2-letter code (26 options each) followed by a 1-digit code (10 options) — how many codes?" — answer box, no tree
- Correct → lesson complete, `mastered = true`
- Incorrect → feedback referencing the rule (not the tree) → Problem B: "A product key is built by choosing 1 of 3 prefixes, then 1 of 8 colors, then 1 of 4 sizes — how many distinct keys are possible?" → result of B determines `mastered` (binary, no partial credit)

## User Stories
- As a student, I can create an account and log in so my progress is saved to me.
- As a student, I can tap through building a decision tree and enter the node count at each level, so I discover the multiplication pattern myself.
- As a student, I get an immediate correct/incorrect signal on every input, with a specific explanation if I'm wrong, so I know exactly what I misunderstood.
- As a student, I cannot skip past a wrong answer in Steps 1–3, so I don't move forward with a broken model.
- As a student, after Step 3 I'm shown the explicit rule mapped onto the tree I just built, so the abstraction connects to what I did.
- As a student, I solve a new problem with no tree, so I can prove I learned the rule, not just the pattern.
- As a student, if I leave mid-lesson and come back later (same or different device), I resume exactly where I left off.
- As a student, I see my current streak and feel a pull to come back tomorrow.
- As a student, after finishing Lesson 1, I see what lesson comes next in the path.
- As a student, the app works the same on my phone as on desktop.

## Build Order
Build vertically, one layer fully working before the next — add tests and pause and ask me for permission to continue after each layer is done.
1. Content model + tree-build interaction (Steps 1–3 mechanics, gating, hints)
2. Instant feedback wired to content model (specific wrong-answer messages, not generic)
3. Progress persistence (resume mid-lesson, cross-device via Firestore)
4. Course path screen (lesson list, locked/unlocked, recommended next, mastery display)
5. Streaks and milestones
No AI, no learning-science layers (spaced repetition, interleaving, etc.) until this lesson works standalone — those are later project phases, not part of this PRD.

## Tests to also consider 
We will test with:
A learner completing one lesson in your subject end to end, getting some problems wrong, and using the feedback to recover.
A learner manipulating the interactive element and watching the visual respond in real time.
A learner leaving mid-lesson and returning to confirm progress and streak persist.
A learner finishing a lesson and seeing the path recommends a sensible next step in the subject.
The whole thing on a phone-sized screen.

## Content Model

### General layout of a lesson
A content model describes a lesson as a sequence of interactive steps (concept, problem, feedback), not a blob of HTML. This is what lets you add lessons in your subject fast, and later lets AI generate them.

- **Three step types**, each defining what it needs: `visual-interactive` (prompt, a `visual` config describing the specific component and its params, per-stage gate(s), final gate), `rule-statement` (explanation + reference to a prior step's visual to overlay), `cold-problem` (prompt, correct value, rule-based feedback). `visual` config takes a `component` key (e.g. `tree-build` for this lesson) plus component-specific params (`treeConfig` for trees) — other lessons can plug in a different component (number line, grid, spinner) without changing the step type.
- **Wrong-answer feedback lives in the content model**, not the UI: `feedbackWrong` has a `default` plus `specificCases` keyed by likely wrong answers.
- **Steps reference each other by `id`**, never by assumed order, so lessons can reorder or reuse steps.
- **Progress tracks per step** (`currentStepIndex`, `stepAnswers`), so resuming works mid-lesson across devices.

### Firestore schema
```
lessons/{lessonId}
  title, subject, order, prerequisiteLessonId
  steps: [
    { id, step: 1|2|3|4|5, type: "visual-interactive"|"rule-statement"|"cold-problem",
      prompt, visual: { component: "tree-build", treeConfig: { levels: [{label, branchCount}] } },
      gated: bool, correctValue, hintText, feedbackWrong: { default, specificCases: [{answer, message}] } }
  ]

users/{userId}
  name, email, streak: { count, lastActiveDate }
  progress/{lessonId}: { currentStepIndex, stepAnswers: {}, mastered: bool|null, completedAt }
```

## Tech Stack
- Frontend: React + Vite
- Visuals: custom SVG (tree rendering, animated splits) — no charting lib needed for this lesson
- Backend: Firebase (Auth + Firestore)
- Hosting: Firebase Hosting
- State: React state/context for in-lesson interaction; Firestore writes on step completion (debounced) for persistence
- Testing: Vitest, React Testing Library, Playwright