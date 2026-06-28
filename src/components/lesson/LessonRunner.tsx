import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isLayerActive } from '../../config/buildLayer'
import type { Lesson, LessonProgress, Op, VisualInteractiveStep } from '../../types/lesson'
import { useEnterKey } from '../../hooks/useEnterKey'
import { AllowedOpsContext, allowedOpsForLevel, newlyUnlockedAfterLevel } from './AllowedOpsContext'
import { VisualInteractiveStepView } from '../steps/VisualInteractiveStep'
import { RuleStatementStepView } from '../steps/RuleStatementStep'
import { ColdProblemStepView } from '../steps/ColdProblemStep'
import { GuidedSolveStepView } from '../steps/GuidedSolveStep'
import { EquationBuildStepView } from '../steps/EquationBuildStep'
import { StarsBarsSolveStepView } from '../steps/StarsBarsSolveStep'
import { SlotSelectStepView } from '../steps/SlotSelectStep'
import { DiscoveryStepView } from '../steps/DiscoveryStep'
import { CaseworkStepView } from '../steps/CaseworkStep'
import { ClassifyStepView } from '../steps/ClassifyStep'
import { MechanismStepView } from '../steps/MechanismStep'
import { OrgoStepView } from '../steps/OrgoStep'
import './LessonRunner.css'

// AI-only; lazy so the AI SDK loads only when a learner reaches the teach step.
const TeachBackStepView = lazy(() =>
  import('../steps/TeachBackStep').then((m) => ({ default: m.TeachBackStepView })),
)

type LessonRunnerProps = {
  lesson: Lesson
  progress: LessonProgress
  onProgressChange: (progress: LessonProgress) => void
  onLessonStart?: () => void
  /** Course this lesson belongs to — sets the back/next links. */
  courseId?: string
  /** When false, the math operator-unlock ladder + its notice are suppressed
   * (chemistry lessons don't use ! P C). */
  mathProgression?: boolean
}

function stepKindLabel(type: Lesson['steps'][number]['type']): string {
  if (type === 'visual-interactive') return 'Build'
  if (type === 'discovery') return 'Explore'
  if (type === 'mechanism') return 'Push'
  if (type === 'orgo') return 'Push'
  if (type === 'casework') return 'Cases'
  if (type === 'classify') return 'Identify'
  if (type === 'rule-statement') return 'Rule'
  if (type === 'equation-build') return 'Build'
  if (type === 'guided-solve' || type === 'slot-select' || type === 'stars-bars-solve') return 'Solve'
  if (type === 'teach-back') return 'Teach'
  return 'Test'
}

const UNLOCK_INFO: Partial<Record<Op, { code: string; desc: string }>> = {
  '!': { code: 'n!', desc: 'for factorials' },
  P: { code: 'P(n, k)', desc: 'to count permutations' },
  C: { code: 'C(n, k)', desc: 'to count combinations' },
}

/** Calm note on a completion screen announcing operators that open up in the
 * lessons ahead. The unlock is by level, so this is a heads-up, not a gate. */
function UnlockNotice({ ops }: { ops: Op[] }) {
  const shown = ops.filter((op) => UNLOCK_INFO[op] != null)
  if (shown.length === 0) return null
  return (
    <div className="lesson-runner__unlock">
      <span className="lesson-runner__unlock-tag">New tools unlocked</span>
      <p className="lesson-runner__unlock-msg">
        From here on, you can type{' '}
        {shown.map((op, i) => {
          const info = UNLOCK_INFO[op]
          if (!info) return null
          return (
            <span key={op}>
              {i > 0 && (i === shown.length - 1 ? ' and ' : ', ')}
              <code className="lesson-runner__unlock-code">{info.code}</code> {info.desc}
            </span>
          )
        })}
        .
      </p>
    </div>
  )
}

export function LessonRunner({
  lesson,
  progress,
  onProgressChange,
  onLessonStart,
  courseId = 'counting',
  mathProgression = true,
}: LessonRunnerProps) {
  const [started, setStarted] = useState(
    progress.currentStepIndex > 0 || progress.mastered !== null || !!progress.completedAt,
  )
  // Which operators the learner may type is fixed by the lesson's level (order),
  // not by what they've completed — so skipping ahead still grants the right ops.
  // Every gate in the active step reads this via AllowedOpsContext. Courses
  // without the math ladder (chemistry) stay on the basic set.
  const allowedOps = useMemo(
    () => allowedOpsForLevel(mathProgression ? lesson.order : 1),
    [lesson.order, mathProgression],
  )
  // Operators that open up once this level is behind the learner, announced on
  // the completion screen (math courses only).
  const newlyUnlocked = useMemo(
    () => (mathProgression ? newlyUnlockedAfterLevel(lesson.order) : []),
    [lesson.order, mathProgression],
  )

  const steps = lesson.steps
  const navigate = useNavigate()
  const coursePath = `/course/${courseId}`

  useEffect(() => {
    if (progress.currentStepIndex > 0 || progress.mastered !== null || progress.completedAt) {
      setStarted(true)
    }
  }, [progress.currentStepIndex, progress.mastered, progress.completedAt])

  const currentStep = steps[progress.currentStepIndex]
  const lastIndex = steps.length - 1
  // Highest step the learner may jump to: every step they've reached, or all of
  // them once the lesson is finished (so a restart can still navigate freely).
  const reached = progress.completedAt
    ? lastIndex
    : Math.max(progress.furthestStepIndex ?? 0, progress.currentStepIndex)

  const handleStepComplete = useCallback(() => {
    const nextIndex = progress.currentStepIndex + 1
    const lastIdx = steps.length - 1
    onProgressChange({
      ...progress,
      currentStepIndex: nextIndex,
      furthestStepIndex: Math.max(progress.furthestStepIndex ?? 0, Math.min(nextIndex, lastIdx)),
      ...(nextIndex >= steps.length ? { completedAt: new Date().toISOString() } : {}),
    })
  }, [steps.length, progress, onProgressChange])

  const handleColdComplete = useCallback(
    (mastered: boolean) => {
      onProgressChange({
        ...progress,
        currentStepIndex: steps.length,
        furthestStepIndex: steps.length - 1,
        mastered,
        completedAt: new Date().toISOString(),
      })
    },
    [steps.length, progress, onProgressChange],
  )

  const handleStart = () => {
    setStarted(true)
    onLessonStart?.()
  }

  const handleReplay = useCallback(() => {
    // Restarting keeps the lesson marked finished; it just drops back to step 1.
    onProgressChange({ ...progress, currentStepIndex: 0 })
  }, [progress, onProgressChange])

  const handleJump = useCallback(
    (index: number) => {
      if (index > reached) return
      onProgressChange({
        ...progress,
        currentStepIndex: index,
        furthestStepIndex: Math.max(progress.furthestStepIndex ?? 0, index),
      })
    },
    [progress, reached, onProgressChange],
  )

  // Enter starts the lesson from the start screen.
  useEnterKey(handleStart, !started && progress.currentStepIndex === 0)
  // On the completion screen, Enter goes to the next lesson (the course path).
  const lessonFinished = progress.currentStepIndex >= steps.length
  useEnterKey(() => navigate(coursePath), lessonFinished && isLayerActive(4))

  if (
    progress.mastered !== null &&
    progress.completedAt &&
    progress.currentStepIndex >= steps.length
  ) {
    return (
      <div className="lesson-runner lesson-runner--complete">
        <span
          className={`lesson-runner__seal ${progress.mastered ? '' : 'lesson-runner__seal--retry'}`}
          aria-hidden="true"
        >
          {progress.mastered ? '✓' : '↻'}
        </span>
        <h2>{progress.mastered ? 'Lesson mastered' : 'Almost there'}</h2>
        <p className="lesson-runner__mastery">
          {progress.mastered
            ? (lesson.completionMessage ?? `You mastered ${lesson.title.toLowerCase()}.`)
            : 'Review the idea and try again later. It clicks with practice.'}
        </p>
        {progress.mastered && <UnlockNotice ops={newlyUnlocked} />}
        <div className="lesson-runner__actions">
          <button type="button" className="lesson-runner__replay" onClick={handleReplay}>
            Replay lesson
          </button>
          {isLayerActive(4) && (
            <Link to={coursePath} className="lesson-runner__course-link">
              Next lesson
            </Link>
          )}
        </div>
      </div>
    )
  }

  if (!started && progress.currentStepIndex === 0) {
    return (
      <div className="lesson-runner lesson-runner--start">
        <span className="eyebrow">{lesson.subject}</span>
        <h1 className="lesson-runner__title">{lesson.title}</h1>
        <p className="lesson-runner__subject">
          {lesson.tagline ?? 'Work through it by hand, get instant feedback, and discover the rule for yourself.'}
        </p>
        <button type="button" className="lesson-runner__start" onClick={handleStart}>
          Start lesson
        </button>
      </div>
    )
  }

  if (!currentStep) {
    return (
      <div className="lesson-runner lesson-runner--complete">
        <h2>Lesson complete!</h2>
        <UnlockNotice ops={newlyUnlocked} />
        <div className="lesson-runner__actions">
          <button type="button" className="lesson-runner__replay" onClick={handleReplay}>
            Replay lesson
          </button>
          {isLayerActive(4) && (
            <Link to={coursePath} className="lesson-runner__course-link">
              Next lesson
            </Link>
          )}
        </div>
      </div>
    )
  }

  const referenceStep = steps.find(
    (s): s is VisualInteractiveStep =>
      s.type === 'visual-interactive' &&
      currentStep.type === 'rule-statement' &&
      s.id === currentStep.referenceStepId,
  )

  return (
    <AllowedOpsContext.Provider value={allowedOps}>
      <div className="lesson-runner">
      <div className="lesson-runner__topbar">
        {isLayerActive(4) && (
            <Link to={coursePath} className="lesson-runner__back-inline">
            ← Course path
          </Link>
        )}
      </div>
      <div className="lesson-runner__header">
        <span className="lesson-runner__step-label">
          Step {progress.currentStepIndex + 1} of {steps.length}
        </span>
        <div className="lesson-runner__steps" role="tablist" aria-label="Lesson steps">
          {steps.map((s, i) => {
            const segState =
              i === progress.currentStepIndex ? 'current' : i <= reached ? 'done' : 'locked'
            return (
              <button
                key={s.id}
                type="button"
                className={`lesson-runner__step-seg lesson-runner__step-seg--${segState}`}
                onClick={() => handleJump(i)}
                disabled={segState === 'locked'}
                aria-current={segState === 'current' ? 'step' : undefined}
                aria-label={`Step ${i + 1}: ${stepKindLabel(s.type)}${segState === 'locked' ? ' (locked)' : ''}`}
                title={`Step ${i + 1} · ${stepKindLabel(s.type)}`}
              />
            )
          })}
        </div>
      </div>

      {currentStep.type === 'visual-interactive' && (
        <VisualInteractiveStepView
          key={currentStep.id}
          step={currentStep}
          onComplete={handleStepComplete}
        />
      )}

      {currentStep.type === 'rule-statement' && (
        <RuleStatementStepView
          key={currentStep.id}
          step={currentStep}
          referenceStep={referenceStep}
          onComplete={handleStepComplete}
        />
      )}

      {currentStep.type === 'guided-solve' && (
        <GuidedSolveStepView
          key={currentStep.id}
          step={currentStep}
          onComplete={handleStepComplete}
        />
      )}

      {currentStep.type === 'equation-build' && (
        <EquationBuildStepView
          key={currentStep.id}
          step={currentStep}
          onComplete={handleStepComplete}
        />
      )}

      {currentStep.type === 'stars-bars-solve' && (
        <StarsBarsSolveStepView
          key={currentStep.id}
          step={currentStep}
          onComplete={handleStepComplete}
        />
      )}

      {currentStep.type === 'slot-select' && (
        <SlotSelectStepView
          key={currentStep.id}
          step={currentStep}
          onComplete={handleStepComplete}
        />
      )}

      {currentStep.type === 'discovery' && (
        <DiscoveryStepView
          key={currentStep.id}
          step={currentStep}
          onComplete={handleStepComplete}
        />
      )}

      {currentStep.type === 'mechanism' && (
        <MechanismStepView
          key={currentStep.id}
          step={currentStep}
          onComplete={handleStepComplete}
        />
      )}

      {currentStep.type === 'orgo' && (
        <OrgoStepView key={currentStep.id} step={currentStep} onComplete={handleStepComplete} />
      )}

      {currentStep.type === 'casework' && (
        <CaseworkStepView
          key={currentStep.id}
          step={currentStep}
          onComplete={handleStepComplete}
        />
      )}

      {currentStep.type === 'classify' && (
        <ClassifyStepView key={currentStep.id} step={currentStep} onComplete={handleStepComplete} />
      )}

      {currentStep.type === 'teach-back' && (
        <Suspense fallback={<p className="lesson-runner__mastery">Loading…</p>}>
          <TeachBackStepView key={currentStep.id} step={currentStep} onComplete={handleStepComplete} />
        </Suspense>
      )}

      {currentStep.type === 'cold-problem' && (
        <ColdProblemStepView
          key={currentStep.id}
          step={currentStep}
          onComplete={handleColdComplete}
        />
      )}
      </div>
    </AllowedOpsContext.Provider>
  )
}
