import { Link } from 'react-router-dom'
import { courseLessons } from '../../content/course'
import { availableLessonIds } from '../../content/lessons'
import { useAllLessonProgress } from '../../hooks/useLessonProgress'
import { useAuth } from '../../context/AuthContext'
import './CoursePath.css'

function isLessonUnlocked(
  lessonId: string,
  progressMap: Record<string, { mastered: boolean | null }>,
): boolean {
  const lesson = courseLessons.find((l) => l.id === lessonId)
  if (!lesson) return false
  if (!lesson.prerequisiteLessonId) return true
  const prereq = progressMap[lesson.prerequisiteLessonId]
  return prereq?.mastered === true
}

// trail geometry: x is a 0-100 fraction of the trail width, y is in px.
const STEP_Y = 132
const TOP_PAD = 70
// a hand-drawn-feeling meander down the left; labels live to the right
const WEAVE = [36, 18, 38, 20, 36, 18, 38, 20]

function buildCurve(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const cur = points[i]
    const c1y = prev.y + STEP_Y * 0.55
    const c2y = cur.y - STEP_Y * 0.55
    d += ` C ${prev.x} ${c1y} ${cur.x} ${c2y} ${cur.x} ${cur.y}`
  }
  return d
}

export function CoursePath() {
  const { displayName, logOut, isConfigured, user } = useAuth()
  const { progressMap, streak, loading } = useAllLessonProgress()

  const recommendedId = courseLessons.find(
    (l) => isLessonUnlocked(l.id, progressMap) && progressMap[l.id]?.mastered !== true,
  )?.id

  const masteredCount = courseLessons.filter((l) => progressMap[l.id]?.mastered === true).length
  const total = courseLessons.length
  const pct = Math.round((masteredCount / total) * 100)

  const heading =
    masteredCount === 0
      ? "Let's count something."
      : masteredCount === total
        ? 'Path complete. You counted it all.'
        : `${total - masteredCount} to go, keep the momentum.`
  const cheer = displayName
    ? `${displayName}, ${heading.charAt(0).toLowerCase()}${heading.slice(1)}`
    : heading

  const nodes = courseLessons.map((lesson, i) => {
    const unlocked = isLessonUnlocked(lesson.id, progressMap)
    const progress = progressMap[lesson.id]
    const mastered = progress?.mastered === true
    const started = (progress?.currentStepIndex ?? 0) > 0 && !mastered
    const isPlaceholder = !availableLessonIds.has(lesson.id)
    const comingSoon = isPlaceholder && unlocked
    const isActive = lesson.id === recommendedId && !mastered && unlocked && !comingSoon
    const tappable = unlocked && !isPlaceholder
    const state = mastered
      ? 'mastered'
      : !unlocked
        ? 'locked'
        : comingSoon
          ? 'soon'
          : isActive
            ? 'active'
            : 'open'
    return {
      lesson,
      state,
      isActive,
      started,
      tappable,
      x: WEAVE[i % WEAVE.length],
      y: TOP_PAD + i * STEP_Y,
    }
  })

  const goalY = TOP_PAD + total * STEP_Y
  const trailHeight = goalY + 76
  const curve = buildCurve([...nodes.map((n) => ({ x: n.x, y: n.y })), { x: 28, y: goalY }])

  return (
    <div className="course-path">
      <aside className="course-card">
        <div className="course-card__top">
          <BrandMark />
          {isConfigured && user && (
            <button type="button" className="course-path__logout" onClick={() => logOut()}>
              Log out
            </button>
          )}
        </div>

        <span className="course-path__level">Combinatorics · Level 1</span>
        <h1 className="course-path__title">Counting Strategies</h1>
        <p className="course-path__cheer">{cheer}</p>

        <div className="course-card__progress" aria-label={`${pct} percent of the course complete`}>
          <div className="course-card__progress-head">
            <span>Course progress</span>
            <span className="course-card__progress-pct">{pct}%</span>
          </div>
          <div className="course-path__progress-bar">
            <span className="course-path__progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="course-card__tiles">
          <div className="tile">
            <span className="tile__num">{total}</span>
            <span className="tile__label">Lessons</span>
          </div>
          <div className="tile">
            <span className="tile__num tile__num--grow">{masteredCount}</span>
            <span className="tile__label">Mastered</span>
          </div>
          <div className={`tile ${streak.count > 0 ? 'tile--lit' : ''}`}>
            <span className="tile__num tile__num--streak">
              <FlameIcon />
              {streak.count}
            </span>
            <span className="tile__label">Day streak</span>
          </div>
        </div>
      </aside>

      <section className="trail-panel">
        {loading ? (
          <p className="course-path__loading">Loading your trail…</p>
        ) : (
          <div className="trail" style={{ height: trailHeight }}>
          <svg
            className="trail__curve"
            viewBox={`0 0 100 ${trailHeight}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d={curve} className="trail__curve-line" />
          </svg>

          {nodes.map((n, i) => (
            <div
              key={n.lesson.id}
              className={`stop stop--${n.state}`}
              style={{ left: `${n.x}%`, top: n.y, ['--i' as string]: i }}
            >
              {n.tappable ? (
                <Link to={`/lesson/${n.lesson.id}`} className="coin-wrap">
                  <CoinFace n={n} />
                </Link>
              ) : (
                <div className="coin-wrap coin-wrap--static">
                  <CoinFace n={n} />
                </div>
              )}
              <div className="stop__label">
                <span className="stop__lesson-title">{n.lesson.title}</span>
                <span className={`stop__status stop__status--${n.state}`}>
                  {n.state === 'mastered'
                    ? 'Mastered'
                    : n.state === 'locked'
                      ? 'Locked'
                      : n.state === 'soon'
                        ? 'Coming soon'
                        : n.isActive
                          ? n.started
                            ? 'Continue'
                            : 'Start here'
                          : 'Up next'}
                </span>
              </div>
            </div>
          ))}

          <div
            className="stop stop--goal"
            style={{ left: '28%', top: goalY, ['--i' as string]: total }}
          >
            <div className="coin-wrap coin-wrap--static">
              <span className="coin coin--goal">
                <TrophyIcon />
              </span>
            </div>
            <div className="stop__label">
              <span className="stop__lesson-title">
                {masteredCount === total ? 'Path mastered!' : 'Finish line'}
              </span>
              <span className="stop__status stop__status--locked">All {total} mastered</span>
            </div>
          </div>
        </div>
        )}
      </section>
    </div>
  )
}

function CoinFace({
  n,
}: {
  n: { lesson: { order: number }; state: string; isActive: boolean }
}) {
  return (
    <>
      {n.isActive && (
        <>
          <span className="coin__ring coin__ring--1" aria-hidden="true" />
          <span className="coin__ring coin__ring--2" aria-hidden="true" />
          <span className="coin__pin">Start</span>
        </>
      )}
      <span className={`coin coin--${n.state}`}>
        {n.state === 'mastered' ? (
          <CheckIcon />
        ) : n.state === 'locked' ? (
          <LockIcon />
        ) : n.state === 'soon' ? (
          <SparkIcon />
        ) : (
          <span className="coin__num">{n.lesson.order}</span>
        )}
      </span>
    </>
  )
}

function BrandMark() {
  return (
    <span className="course-card__mark" aria-hidden="true">
      <svg viewBox="0 0 64 64">
        <circle cx="20" cy="20" r="5" />
        <circle cx="44" cy="20" r="5" />
        <circle cx="32" cy="32" r="5" className="course-card__mark-pick" />
        <circle cx="20" cy="44" r="5" />
        <circle cx="44" cy="44" r="5" />
      </svg>
    </span>
  )
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2c.5 3-1.5 4.5-3 6-1.7 1.7-3 3.6-3 6a6 6 0 0 0 12 0c0-2-1-3.7-2-5 0 1.2-.8 2-1.7 2 .7-2.7-.6-4.8-2.3-6.3.3 1.8-.7 2.8-1.5 3.4.4-1.9-.3-4-.5-6.1Z"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm3 8H9V7a3 3 0 0 1 6 0v3Z"
      />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2l1.8 5.4a4 4 0 0 0 2.8 2.8L22 12l-5.4 1.8a4 4 0 0 0-2.8 2.8L12 22l-1.8-5.4a4 4 0 0 0-2.8-2.8L2 12l5.4-1.8a4 4 0 0 0 2.8-2.8L12 2Z"
      />
    </svg>
  )
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18 2H6v2H3v3a4 4 0 0 0 4 4 5 5 0 0 0 4 2.9V17H8v2h8v-2h-3v-3.1A5 5 0 0 0 17 11a4 4 0 0 0 4-4V4h-3V2ZM5 7V6h1v3a2 2 0 0 1-1-2Zm14 0a2 2 0 0 1-1 2V6h1v1Z"
      />
    </svg>
  )
}
