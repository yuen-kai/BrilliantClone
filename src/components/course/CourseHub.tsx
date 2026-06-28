import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { courses } from '../../content/courses'
import { courseTestProgressId } from '../../content/courseTests'
import { getTestStatus, readTestMeta, formatRemaining } from '../../lib/courseTestState'
import { useAllLessonProgress, clearDemoProgress } from '../../hooks/useLessonProgress'
import { useAuth } from '../../context/AuthContext'
import './CourseHub.css'

/** The course-selection screen: every course as a pickable card. Choosing one
 * routes to /course/:courseId; each card also surfaces its course-test state
 * (primed countdown, retest button, or the reinforced badge). */
export function CourseHub() {
  const { progressMap } = useAllLessonProgress()
  const { logOut, isConfigured, user, demoMode } = useAuth()
  const [exiting, setExiting] = useState(false)

  const handleExit = () => {
    if (demoMode) clearDemoProgress()
    setExiting(true)
    void logOut()
  }

  // AuthGate handles the redirect when Firebase is configured; in demo /
  // unconfigured mode it lets everyone through, so route to /login ourselves
  // once logout has actually cleared the session (also dodges a redirect race).
  if (exiting && !user && !demoMode) {
    return <Navigate to="/login" replace />
  }

  const showExit = (isConfigured && user) || demoMode

  return (
    <main className="course-hub">
      <header className="course-hub__head">
        <h1 className="course-hub__title">Choose a course</h1>
        {showExit && (
          <button type="button" className="course-hub__logout" onClick={handleExit}>
            {demoMode ? 'Exit demo' : 'Log out'}
          </button>
        )}
      </header>

      <ul className="course-hub__grid">
        {courses.map((course, i) => {
          const total = course.lessons.length
          const mastered = course.lessons.filter((l) => progressMap[l.id]?.mastered === true).length
          const started = course.lessons.some((l) => (progressMap[l.id]?.currentStepIndex ?? 0) > 0)
          const pct = total ? Math.round((mastered / total) * 100) : 0
          const allMastered = total > 0 && mastered === total
          const status = getTestStatus(
            allMastered,
            readTestMeta(progressMap[courseTestProgressId(course.id)]?.stepAnswers),
          )
          const testHref = `/course/${course.id}/test`
          return (
            <li key={course.id}>
              <div className={`course-hub__card course-hub__card--${status.phase}`}>
                {status.phase === 'reinforced' && (
                  <span className="course-hub__ribbon" aria-hidden="true">
                    ★ Reinforced
                  </span>
                )}
                <Link to={`/course/${course.id}`} className="course-hub__main">
                  <span className="course-hub__mark" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="course-hub__level">{course.level}</span>
                  <span className="course-hub__name">{course.title}</span>
                  <span className="course-hub__tagline">{course.tagline}</span>
                  <span className="course-hub__meta">
                    {total} lessons
                    {mastered > 0 && <span className="course-hub__pct"> · {pct}% complete</span>}
                  </span>
                  {mastered > 0 && (
                    <span className="course-hub__bar" aria-hidden="true">
                      <span className="course-hub__bar-fill" style={{ width: `${pct}%` }} />
                    </span>
                  )}
                </Link>

                <div className="course-hub__foot">
                  {status.phase === 'retest' ? (
                    <Link to={testHref} className="course-hub__retest">
                      Retest ready →
                    </Link>
                  ) : status.phase === 'available' ? (
                    <Link to={testHref} className="course-hub__testlink">
                      Take the course test →
                    </Link>
                  ) : status.phase === 'primed' ? (
                    <span className="course-hub__primed">
                      ✦ Primed · retest in {formatRemaining((status.retestAt ?? Date.now()) - Date.now())}
                    </span>
                  ) : status.phase === 'reinforced' ? (
                    <span className="course-hub__done">Mastered &amp; reinforced</span>
                  ) : (
                    <Link to={`/course/${course.id}`} className="course-hub__cta">
                      {started ? 'Continue' : 'Start'} →
                    </Link>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
