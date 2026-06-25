# App Preferences & Design Principles

This document defines how this app should be built and how lessons should teach —
across **all** lessons, current and future. Treat it as the source of truth for
tone, interaction design, and quality. When in doubt, optimize for *learning* and
*enjoyment*, not for showing the learner everything.

The principles below are general. Concrete, lesson-specific implementations are
collected as **Examples** at the end — read them as illustrations of the
principles, not as the rules themselves.

## 1. Teaching voice

- **Less text. Less handholding.** Prompts are one short line of scenario, not a
  paragraph. Trust the learner to figure things out.
- **Don't pre-narrate the steps.** Never spell out the procedure or the math the
  learner is meant to discover.
- **Each lesson builds on the last.** Frame new ideas as continuations of what they
  already learned, then introduce the one new twist. Avoid resetting context.
- **Always ask: will they actually learn this, and will they enjoy it?** Favor
  interactions that produce a genuine "aha," not busywork.

## 2. Interactions over number entry

- **Discovery first.** Prefer hands-on manipulation (drag, connect, rearrange,
  place, spin, group) over typing numbers. The interaction is how the idea is
  discovered; numeric input only *confirms* understanding.
- **Drag, not click-to-select**, for moving/connecting/ordering. Drags must reach
  every valid position (start, middle, end — not just the obvious one).
- **Mouse and touch both work** (`touch-action: none`, pointer events).
- **Invent the right interaction per concept.** Don't fall back on a generic input
  when a concrete, manipulable visual would teach better.
- **Keep interactions lightweight; never tedious.** A few drags or a single toggle
  is plenty. If fully manipulating would be busywork (e.g. enumerating 120
  arrangements, crossing out 25 dots one by one), use a lighter control — a toggle
  between two views, a single representative example — that still produces the
  insight. Effort should go into understanding, not clicking.

## 3. Reveal the rule with a small, consistent scaffold

- A lesson teaches a rule by letting the learner *derive* it, broken into a few
  gated sub-steps asked **one at a time**.
- Keep the scaffold **consistent within a concept family** so learners build a
  reusable mental template (e.g. the same two prompts recur across every step in a
  lesson).
- **The learner does the key reasoning.** Ask for the pieces and the result; don't
  hand them the operation that connects them.
- **Progressive disclosure.** Reveal one part at a time. Show the next prompt (and
  any supporting panel) only *after* the current one is answered, and keep the
  harder twist hidden until the learner has committed the baseline answer — never
  show the whole machine at once. (e.g. the learner answers the plain
  arrangement/permutation count first; only then does the "repeats" half appear.)
- End a lesson by naming the rule only *after* it's been discovered, then test it
  on fresh problems with minimal scaffolding.

## 4. Manipulable visual vs. enumeration panel

This is the core pattern for "structure-and-count" lessons. It generalizes across
concepts (arrangements, selections, complements, partitions, …).

- **The visual = the real problem**, in its true (deduplicated / final) form. It is
  what the learner manipulates.
- **The visual must NOT reveal the numeric answer.** No "X of N" counters, no
  success tallies, no arithmetic giveaways. Its only job is to make the underlying
  *structure* — what repeats, what's excluded, what's grouped — visible and
  playable.
- **An optional side panel** can show the larger raw space (e.g. every labeled/
  ordered possibility), appearing **only after** the learner commits the first
  ("naive") number, to reinforce it. **Only when the raw space is small enough to
  enumerate meaningfully** — skip the panel when there are too many possibilities
  (it becomes clutter, not insight). A lightweight alternative (e.g. a toggle that
  shows how the count changes between two views) is often better.
- **Live selection links the two.** When a panel is present, manipulating the visual
  highlights the raw option(s) that map to the current state — so the learner
  *watches* multiple raw cases collapse onto one real outcome.
- **Label both regions** so the relationship is unmistakable (a short tag on the
  visual, a header on the panel).
- **Distinct, consistent color meaning** across the app: one accent for the real/
  final answer, another for the raw/enumerated space. Don't mix them.

## 5. Visual & affordance standards

- **Clear drop/target affordances.** Mid-gesture it must be obvious where an action
  will land: open a gap, highlight or expand the target, show a guide line. The
  learner should never wonder whether an action will be accepted.
- **Design tokens only** (`--accent`, `--grow`, `--spark`, `--flag`, `--paper`,
  `--surface`, `--mono`, `--display`, radii, shadows, …). No hardcoded colors.
  Must look right in light **and** dark mode.
- Keep it clean and uncluttered; animations are quick and purposeful.

## 6. Testing & verification

- **Write end-to-end user-interaction tests** (Playwright) that exercise the real
  gestures — dragging, connecting, reordering — not just that text renders.
- **Use screenshots to judge UX**, including **mid-gesture** frames. Actually look
  at them and evaluate feel and affordance; don't only assert.
- Always run typecheck, lint, unit tests, and the production build before calling
  work done; keep them green (pre-existing unrelated warnings aside).

## 7. Engineering workflow

- **Lazy-senior-dev style:** minimal, clean code; reuse existing infrastructure; no
  narrating comments (comment only non-obvious intent/geometry); no dead code.
- **Data-driven content.** Lessons are data (step definitions); rendering is generic,
  reusable components with clear prop contracts. Adding a lesson shouldn't require
  bespoke plumbing where a shared step type fits.
- **Parallelize independent work with subagents.** When multiple files/components are
  independent, dispatch one focused agent per file with a precise contract and
  integrate centrally. Don't have agents edit shared files.

## Examples (illustrations of the principles above)

These are concrete applications from the Overcounting lesson. Use them as a guide
for the *kind* of interaction expected, then design the equivalent for new topics.

- **Two-prompt scaffold + progressive disclosure (§3):** overcounting steps ask
  "ignoring repeats" (the naive over-count) first; only after that answer is
  committed do the "considering repeats" prompt and the enumeration panel appear.
  The learner supplies the division themselves.
- **Identical items (§4):** letters of a word are plain, swappable tiles with no
  badges — only the visual sameness (two "O"s look identical) signals the repeat.
  Swapping the identical tiles changes nothing visible; the side panel enumerates
  the orderings (e.g. O₁/O₂) and highlights the two that match the current word.
- **Unordered pairs (§4):** a handshake shows **one connection at a time** (a new
  drag replaces the last); the panel lights up both `A → B` and `B → A` to show one
  handshake = two greetings.
- **Circular arrangements (§4):** the learner drags people around a table to change
  neighbors (and can spin it); the panel lists the rotations of the current seating,
  all equal to one arrangement. No fixed marker on the table.
