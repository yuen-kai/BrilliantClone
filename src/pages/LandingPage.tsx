import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { courseLessons } from '../content/course'
import './LandingPage.css'

const TOPIC_BLURBS: Record<string, string> = {
  'lesson-1': 'Count choices in a row by multiplying.',
  'lesson-2': 'Arrange and pick, with and without order.',
  'lesson-3': 'Spot the repeats and divide them out.',
  'lesson-4': 'Split a hard count into clean cases.',
  'lesson-5': "Count what you don't want, then subtract.",
  'lesson-6': 'Share identical things into groups.',
}

const HOW_IT_WORKS = [
  { lead: 'Build the rule.', rest: 'You derive each formula step by step.' },
  { lead: 'Move things around.', rest: 'Drag, connect, and rearrange to see why it works.' },
  { lead: 'Know it cold.', rest: 'Each lesson ends with a fresh problem and no scaffolding.' },
]

export function LandingPage() {
  return (
    <main className="landing">
      <section className="landing__hero">
        <div className="landing__hero-copy">
          <p className="eyebrow landing__eyebrow">COMBINATORICS · BY HAND</p>
          <h1 className="landing__headline">Learn to count anything.</h1>
          <p className="landing__subline">
            Six short lessons on counting the ways things can happen. You build each rule yourself
            and get feedback on every step.
          </p>
          <Link to="/course" className="landing__cta">
            Start the course
            <Arrow />
          </Link>
        </div>

        <Signature />
      </section>

      <section className="landing__section landing__topics" aria-labelledby="topics-heading">
        <h2 id="topics-heading" className="landing__section-title">
          The path
        </h2>
        <ol className="landing__topic-grid">
          {courseLessons.map((lesson) => (
            <li key={lesson.id}>
              <Link to="/course" className="topic">
                <span className="topic__num">{String(lesson.order).padStart(2, '0')}</span>
                <span className="topic__body">
                  <span className="topic__title">{lesson.title}</span>
                  <span className="topic__desc">{TOPIC_BLURBS[lesson.id]}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing__section landing__how" aria-labelledby="how-heading">
        <h2 id="how-heading" className="landing__section-title">
          How it works
        </h2>
        <ol className="landing__how-grid">
          {HOW_IT_WORKS.map((point, i) => (
            <li key={point.lead} className="howcard">
              <span className="howcard__step">{i + 1}</span>
              <p className="howcard__text">
                <strong className="howcard__lead">{point.lead}</strong> {point.rest}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="landing__footer">
        <Quincunx className="landing__footer-mark" />
        <span className="landing__footer-name">Counting Strategies</span>
      </footer>
    </main>
  )
}

const SIG_ROOT = { x: 180, y: 26 }
const SIG_MID = [
  { x: 96, y: 104 },
  { x: 264, y: 104 },
]
const SIG_LEAVES = [32, 96, 160, 200, 264, 328].map((x) => ({ x, y: 182 }))
const SIG_EDGES = [
  { from: SIG_ROOT, to: SIG_MID[0]!, d: '0.2s' },
  { from: SIG_ROOT, to: SIG_MID[1]!, d: '0.2s' },
  ...SIG_LEAVES.map((leaf, i) => ({ from: SIG_MID[i < 3 ? 0 : 1]!, to: leaf, d: '0.62s' })),
]

/** Signature visual: a decision tree that branches 2 then 3, so six ways. */
function Signature() {
  return (
    <div className="landing__signature">
      <div className="landing__sig-frame">
        <svg
          className="landing__sig-svg"
          viewBox="0 0 360 200"
          role="img"
          aria-label="A decision tree branching two ways, then three, making six paths."
        >
          {SIG_EDGES.map((e, i) => (
            <line
              key={i}
              className="landing__sig-branch"
              x1={e.from.x}
              y1={e.from.y}
              x2={e.to.x}
              y2={e.to.y}
              pathLength={1}
              style={{ '--d': e.d } as CSSProperties}
            />
          ))}
          <circle
            className="landing__sig-node landing__sig-node--root"
            cx={SIG_ROOT.x}
            cy={SIG_ROOT.y}
            r={8}
            style={{ '--d': '0.05s' } as CSSProperties}
          />
          {SIG_MID.map((n, i) => (
            <circle
              key={`m${i}`}
              className="landing__sig-node"
              cx={n.x}
              cy={n.y}
              r={7}
              style={{ '--d': '0.42s' } as CSSProperties}
            />
          ))}
          {SIG_LEAVES.map((n, i) => (
            <circle
              key={`l${i}`}
              className="landing__sig-node landing__sig-node--leaf"
              cx={n.x}
              cy={n.y}
              r={6.5}
              style={{ '--d': `${0.95 + i * 0.05}s` } as CSSProperties}
            />
          ))}
        </svg>
        <span className="landing__sig-pill" aria-hidden="true">
          <span className="landing__sig-eq">2 × 3 = </span>
          <span className="landing__sig-count">6</span>
          <span className="landing__sig-ways"> ways</span>
        </span>
      </div>
    </div>
  )
}

function Arrow() {
  return (
    <svg
      className="landing__cta-arrow"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function Quincunx({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="20" cy="20" r="5" />
      <circle cx="44" cy="20" r="5" />
      <circle cx="32" cy="32" r="5" className="landing__footer-mark-pick" />
      <circle cx="20" cy="44" r="5" />
      <circle cx="44" cy="44" r="5" />
    </svg>
  )
}
