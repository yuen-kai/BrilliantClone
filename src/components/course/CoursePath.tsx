import { Link, useNavigate } from 'react-router-dom'
import type { CourseLesson } from '../../types/lesson'
import type { Course } from '../../content/courses'
import { availableLessonIds } from '../../content/lessons'
import { getCourseTest, courseTestProgressId } from '../../content/courseTests'
import { getTestStatus, readTestMeta, formatRemaining, type TestPhase } from '../../lib/courseTestState'
import {
  useAllLessonProgress,
  clearDemoProgress,
  applyCourseDemoState,
  type CourseDemoState,
} from '../../hooks/useLessonProgress'
import { useAuth } from '../../context/AuthContext'
import './CoursePath.css'

function isLessonUnlocked(
  lessonId: string,
  progressMap: Record<string, { mastered: boolean | null }>,
  courseLessons: CourseLesson[],
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

export function CoursePath({ course }: { course: Course }) {
  const courseLessons = course.lessons
  const navigate = useNavigate()
  const { displayName, logOut, isConfigured, user, demoMode, aiEnabled, setAiEnabled } = useAuth()
  const { progressMap, streak, loading } = useAllLessonProgress()

  const handleExit = () => {
    if (demoMode) clearDemoProgress()
    void logOut()
  }

  const recommendedId = courseLessons.find(
    (l) => isLessonUnlocked(l.id, progressMap, courseLessons) && progressMap[l.id]?.mastered !== true,
  )?.id

  const masteredCount = courseLessons.filter((l) => progressMap[l.id]?.mastered === true).length
  const total = courseLessons.length
  const pct = Math.round((masteredCount / total) * 100)

  const heading =
    masteredCount === 0
      ? course.tagline
      : masteredCount === total
        ? 'Path complete. Nicely done.'
        : `${total - masteredCount} to go, keep the momentum.`
  const cheer = displayName
    ? `${displayName}, ${heading.charAt(0).toLowerCase()}${heading.slice(1)}`
    : heading

  const nodes = courseLessons.map((lesson, i) => {
    const unlocked = isLessonUnlocked(lesson.id, progressMap, courseLessons)
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

  // A mixed end-of-course test sits after the last lesson. It unlocks once every
  // lesson is mastered, primes the course on the first pass, then withholds a
  // retest for two days (spaced repetition).
  const test = getCourseTest(course.id)
  const allMastered = total > 0 && masteredCount === total
  const testStatus = getTestStatus(
    allMastered,
    readTestMeta(progressMap[courseTestProgressId(course.id)]?.stepAnswers),
  )
  const testTappable =
    testStatus.phase === 'available' || testStatus.phase === 'retest' || testStatus.phase === 'reinforced'
  const testCoin =
    testStatus.phase === 'reinforced'
      ? 'mastered'
      : testStatus.phase === 'available' || testStatus.phase === 'retest'
        ? 'active'
        : testStatus.phase === 'primed'
          ? 'soon'
          : 'locked'
  const testStatusText =
    testStatus.phase === 'reinforced'
      ? 'Reinforced'
      : testStatus.phase === 'retest'
        ? 'Retest ready'
        : testStatus.phase === 'primed'
          ? `Primed · retest in ${formatRemaining((testStatus.retestAt ?? Date.now()) - Date.now())}`
          : testStatus.phase === 'available'
            ? 'Mix of the whole course'
            : 'Finish all lessons first'
  const demoState: CourseDemoState =
    testStatus.phase === 'reinforced'
      ? 'completion'
      : testStatus.phase === 'primed' || testStatus.phase === 'retest'
        ? 'primed'
        : 'uncompleted'
  const testX = WEAVE[total % WEAVE.length]
  const testY = TOP_PAD + total * STEP_Y

  const goalY = TOP_PAD + (total + (test ? 1 : 0)) * STEP_Y
  const trailHeight = goalY + 76
  const curve = buildCurve([
    ...nodes.map((n) => ({ x: n.x, y: n.y })),
    ...(test ? [{ x: testX, y: testY }] : []),
    { x: 28, y: goalY },
  ])

  return (
    <div className="course-path">
      <aside className="course-card">
        <Link to="/course" className="course-path__all">
          ← All courses
        </Link>
        <div className="course-card__top">
          <BrandMark />
          {((isConfigured && user) || demoMode) && (
            <button type="button" className="course-path__logout" onClick={handleExit}>
              {demoMode ? 'Exit demo' : 'Log out'}
            </button>
          )}
        </div>

        <span className="course-path__level">{course.level}</span>
        <h1 className="course-path__title">{course.title}</h1>
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

        {demoMode && (
          <div className="course-path__demo" role="group" aria-label="Demo controls">
            <span className="course-path__demo-label">Demo state</span>
            <div className="course-path__demo-seg">
              {(['uncompleted', 'primed', 'completion'] as CourseDemoState[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`course-path__demo-btn ${demoState === s ? 'is-on' : ''}`}
                  onClick={() => {
                    applyCourseDemoState(
                      course.id,
                      courseLessons.map((l) => l.id),
                      s,
                    )
                    // Primed/completion deep-link into the reward screen so the
                    // animation plays; uncompleted just refreshes the path.
                    if (s === 'primed') navigate(`/course/${course.id}/test?reward=primed`)
                    else if (s === 'completion') navigate(`/course/${course.id}/test?reward=reinforced`)
                    else window.location.reload()
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            <span className="course-path__demo-label">AI tutor</span>
            <div className="course-path__demo-seg">
              <button
                type="button"
                className={`course-path__demo-btn ${aiEnabled ? 'is-on' : ''}`}
                aria-pressed={aiEnabled}
                onClick={() => setAiEnabled(true)}
              >
                on
              </button>
              <button
                type="button"
                className={`course-path__demo-btn ${!aiEnabled ? 'is-on' : ''}`}
                aria-pressed={!aiEnabled}
                onClick={() => setAiEnabled(false)}
              >
                off
              </button>
            </div>
          </div>
        )}
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

          {test && (
            <div
              className={`stop stop--${testCoin}`}
              style={{ left: `${testX}%`, top: testY, ['--i' as string]: total }}
            >
              {testTappable ? (
                <Link to={`/course/${course.id}/test`} className="coin-wrap">
                  <span className={`coin coin--${testCoin}`}>
                    <TestCoinIcon phase={testStatus.phase} />
                  </span>
                </Link>
              ) : (
                <div className="coin-wrap coin-wrap--static">
                  <span className={`coin coin--${testCoin}`}>
                    <TestCoinIcon phase={testStatus.phase} />
                  </span>
                </div>
              )}
              <div className="stop__label">
                <span className="stop__lesson-title">Course test</span>
                <span className={`stop__status stop__status--${testCoin}`}>{testStatusText}</span>
              </div>
            </div>
          )}

          <div
            className="stop stop--goal"
            style={{ left: '28%', top: goalY, ['--i' as string]: total + (test ? 1 : 0) }}
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

function TestIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      <path
        fill="currentColor"
        d="M9 2a1 1 0 0 0-1 1H7a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-1a1 1 0 0 0-1-1H9Zm0 2h6v2H9V4Z"
      />
      <path
        fill="none"
        stroke="var(--surface, #fff)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.5 13.5l2 2 4-4.5"
      />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 7v5l3.5 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TestCoinIcon({ phase }: { phase: TestPhase }) {
  if (phase === 'primed') return <ClockIcon />
  if (phase === 'locked') return <LockIcon />
  // available, retest, and reinforced all keep the test icon; the coin color
  // (active purple vs mastered green) is what marks a passed test from a fresh one.
  return <TestIcon />
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
