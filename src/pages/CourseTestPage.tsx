import { useState } from 'react'
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { getCourse, defaultCourseId } from '../content/courses'
import { getCourseTest, courseTestProgressId, type TestQuestion } from '../content/courseTests'
import { getTestStatus, readTestMeta, formatRemaining, type TestMeta } from '../lib/courseTestState'
import { useLessonProgress, useAllLessonProgress } from '../hooks/useLessonProgress'
import { GateInput } from '../components/lesson/GateInput'
import { ChoiceInput } from '../components/lesson/ChoiceInput'
import { FeedbackBanner } from '../components/lesson/FeedbackBanner'
import { ContinueButton } from '../components/lesson/ContinueButton'
import './CourseTestPage.css'

type Answered = { correct: boolean }

/** Fisher–Yates shuffle, so each attempt mixes the whole course in a fresh order. */
function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const CONFETTI_COLORS = ['#6c63ff', '#34c77b', '#f3a417', '#ff6b6b', '#4dabf7', '#f3c14b']
const CONFETTI = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 61) % 100,
  delay: ((i % 6) * 0.16).toFixed(2),
  dur: (1.7 + ((i * 7) % 10) / 10).toFixed(2),
  rot: (i * 73) % 360,
  bg: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
}))

export function CourseTestPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const course = getCourse(courseId)
  const test = getCourseTest(courseId)
  // Demo deep-link: ?reward=primed|reinforced opens straight on that reward
  // screen (with its animation), skipping the quiz.
  const rewardDemo = searchParams.get('reward')

  const { progress, persistProgress, loading: testLoading } = useLessonProgress(
    courseTestProgressId(courseId ?? ''),
  )
  const { progressMap, loading: allLoading } = useAllLessonProgress()

  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>(
    rewardDemo === 'primed' || rewardDemo === 'reinforced' ? 'result' : 'intro',
  )
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(rewardDemo ? (test?.questions.length ?? 0) : 0)
  const [answered, setAnswered] = useState<Answered | null>(null)
  const [errorNonce, setErrorNonce] = useState(0)
  // Questions in their shuffled order for the current attempt.
  const [order, setOrder] = useState<TestQuestion[]>([])
  // What the status was when this attempt began — decides prime vs reinforce.
  const [attemptPhase, setAttemptPhase] = useState<'available' | 'retest' | 'reinforced'>(
    rewardDemo === 'reinforced' ? 'retest' : 'available',
  )

  if (!course || !test) {
    return (
      <div className="ctest ctest--missing">
        <p>That course test wasn’t found.</p>
        <Link to={`/course/${defaultCourseId}`}>Back to courses</Link>
      </div>
    )
  }

  const coursePath = `/course/${course.id}`

  if (testLoading || allLoading) {
    return (
      <div className="ctest ctest--missing">
        <p>Loading…</p>
      </div>
    )
  }

  const allMastered = course.lessons.every((l) => progressMap[l.id]?.mastered === true)
  const meta = readTestMeta(progress.stepAnswers)
  const status = getTestStatus(allMastered, meta)

  // --- Gates: not all lessons done, or still in the 2-day cooldown.
  // Skipped while showing a result: finishing an attempt just stamped
  // primedAt/retestedAt, and the reward screen must win over the cooldown. -----
  if (phase !== 'result' && status.phase === 'locked') {
    return (
      <div className="ctest">
        <div className="ctest__card ctest__intro">
          <h1 className="ctest__title">Course test locked</h1>
          <p className="ctest__lead">Master every lesson in this course first, then the mixed test opens up.</p>
          <Link to={coursePath} className="ctest__back">
            ← Back to the course
          </Link>
        </div>
      </div>
    )
  }

  if (phase !== 'result' && status.phase === 'primed') {
    const remaining = status.retestAt ? status.retestAt - Date.now() : 0
    return (
      <div className="ctest">
        <div className="ctest__card ctest__intro ctest__primed">
          <span className="ctest__seal ctest__seal--primed" aria-hidden="true">
            ✦
          </span>
          <h1 className="ctest__title">Course primed</h1>
          <p className="ctest__lead">
            You passed the test, so this course is primed. To make it stick, the retest unlocks after a short
            wait. Come back then and prove you still remember it.
          </p>
          <p className="ctest__rule">Retest unlocks in {formatRemaining(remaining)}</p>
          <Link to={coursePath} className="ctest__back">
            ← Back to the course
          </Link>
        </div>
      </div>
    )
  }

  const questions = order.length ? order : test.questions
  const total = test.questions.length
  const needed = Math.ceil(test.passThreshold * total)
  const q = questions[index]
  const isRetest = status.phase === 'retest'
  const isPractice = status.phase === 'reinforced'

  const grade = (correct: boolean) => {
    if (correct) setScore((s) => s + 1)
    else setErrorNonce((n) => n + 1)
    setAnswered({ correct })
  }

  const startQuiz = () => {
    setAttemptPhase(status.phase as 'available' | 'retest' | 'reinforced')
    setOrder(shuffle(test.questions))
    setPhase('quiz')
    setIndex(0)
    setScore(0)
    setAnswered(null)
  }

  const next = () => {
    setAnswered(null)
    if (index + 1 >= total) {
      const passed = score >= needed
      const nowISO = new Date().toISOString()
      const nextMeta: TestMeta = { ...meta }
      if (passed && attemptPhase === 'available') nextMeta.primedAt = nowISO
      if (passed && attemptPhase === 'retest') nextMeta.retestedAt = nowISO
      persistProgress({
        currentStepIndex: 0,
        stepAnswers: { ...(progress.stepAnswers ?? {}), ...nextMeta },
        mastered: !!nextMeta.primedAt,
        completedAt: nowISO,
        furthestStepIndex: 0,
      })
      setPhase('result')
    } else {
      setIndex((i) => i + 1)
    }
  }

  if (phase === 'intro') {
    return (
      <div className="ctest">
        <div className="ctest__card ctest__intro">
          <span className="eyebrow ctest__eyebrow">{course.level}</span>
          <h1 className="ctest__title">{isRetest ? `Retest · ${course.title}` : test.title}</h1>
          <p className="ctest__lead">
            {isRetest
              ? 'Two days on. Can you still mix the whole course? Pass to lock it into long-term memory.'
              : isPractice
                ? 'You’ve already reinforced this course. Run it again for practice anytime.'
                : test.intro}
          </p>
          <p className="ctest__rule">
            {total} questions · pass with {needed} correct
          </p>
          <ContinueButton className="ctest__primary" onClick={startQuiz}>
            {isRetest ? 'Start the retest' : isPractice ? 'Practice again' : 'Start the test'}
          </ContinueButton>
          <Link to={coursePath} className="ctest__back">
            ← Back to the course
          </Link>
        </div>
      </div>
    )
  }

  if (phase === 'result') {
    const passed = score >= needed
    const justPrimed = passed && attemptPhase === 'available'
    const justReinforced = passed && attemptPhase === 'retest'
    const sealClass = !passed
      ? 'is-fail'
      : justReinforced
        ? 'is-reinforced'
        : justPrimed
          ? 'is-primed'
          : 'is-pass'
    const seal = !passed ? '↻' : justReinforced ? '★' : justPrimed ? '✦' : '✓'
    const heading = !passed
      ? 'Not quite yet'
      : justReinforced
        ? 'Locked in!'
        : justPrimed
          ? 'Course primed!'
          : 'Still sharp'
    const message = !passed
      ? `You need ${needed} to pass. Review the lessons and try again; it clicks with practice.`
      : justReinforced
        ? 'You recalled the whole course after a two-day gap. This one is in long-term memory, fully mastered.'
        : justPrimed
          ? 'You’ve got it for now. Priming locks in once you pass the retest in two days.'
          : 'You can still mix and match every strategy in this course.'
    return (
      <div className="ctest">
        <div className={`ctest__card ctest__result ${sealClass}`}>
          {justReinforced && (
            <div className="ctest__confetti" aria-hidden="true">
              {CONFETTI.map((c, i) => (
                <span
                  key={i}
                  className="ctest__confetti-piece"
                  style={{
                    left: `${c.left}%`,
                    background: c.bg,
                    animationDelay: `${c.delay}s`,
                    animationDuration: `${c.dur}s`,
                    ['--rot' as string]: `${c.rot}deg`,
                  }}
                />
              ))}
            </div>
          )}
          <div className="ctest__sealwrap" aria-hidden="true">
            {passed && (
              <>
                <span className="ctest__ring" />
                <span className="ctest__ring" />
                <span className="ctest__ring" />
              </>
            )}
            <span className="ctest__seal">{seal}</span>
          </div>
          <h1 className="ctest__title">{heading}</h1>
          <p className="ctest__score">
            You scored <strong>{score}</strong> / {total}
          </p>
          <p className="ctest__lead">{message}</p>
          {justPrimed && (
            <div className="ctest__steps" aria-hidden="true">
              <span className="ctest__step is-done">Primed</span>
              <span className="ctest__step-arrow">→</span>
              <span className="ctest__step">Retest in 2 days</span>
              <span className="ctest__step-arrow">→</span>
              <span className="ctest__step">Mastered</span>
            </div>
          )}
          <div className="ctest__actions">
            {passed ? (
              <ContinueButton className="ctest__primary" onClick={() => navigate('/course')}>
                See all courses
              </ContinueButton>
            ) : (
              <ContinueButton className="ctest__primary" onClick={startQuiz}>
                Try again
              </ContinueButton>
            )}
            {!passed && (
              <Link to={coursePath} className="ctest__back">
                ← Back to the course
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ctest">
      <div className="ctest__card">
        <div className="ctest__progress">
          <span className="ctest__counter">
            {isRetest ? 'Retest · ' : ''}Question {index + 1} of {total}
          </span>
          <div className="ctest__bar">
            <span className="ctest__bar-fill" style={{ width: `${(index / total) * 100}%` }} />
          </div>
        </div>

        <p className="ctest__prompt">{q.prompt}</p>

        {!answered ? (
          <QuestionInput q={q} errorNonce={errorNonce} onGrade={grade} />
        ) : (
          <div className="ctest__after">
            <FeedbackBanner
              message={answered.correct ? 'Correct!' : 'Not quite.'}
              variant={answered.correct ? 'correct' : 'wrong'}
            />
            {q.explain && <p className="ctest__explain">{q.explain}</p>}
            <ContinueButton className="ctest__primary" onClick={next}>
              {index + 1 >= total ? 'See results' : 'Next question'}
            </ContinueButton>
          </div>
        )}
      </div>
    </div>
  )
}

function QuestionInput({
  q,
  errorNonce,
  onGrade,
}: {
  q: TestQuestion
  errorNonce: number
  onGrade: (correct: boolean) => void
}) {
  if (q.kind === 'numeric') {
    return (
      <GateInput
        label="Your answer"
        errorNonce={errorNonce}
        onSubmit={(v) => onGrade(v === q.correctValue)}
      />
    )
  }
  return <ChoiceInput options={q.options} onPick={(id) => onGrade(id === q.correctId)} />
}
