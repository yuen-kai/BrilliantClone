import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isLayerActive } from '../../config/buildLayer'
import type { Lesson, LessonProgress, VisualInteractiveStep } from '../../types/lesson'
import { VisualInteractiveStepView } from '../steps/VisualInteractiveStep'
import { RuleStatementStepView } from '../steps/RuleStatementStep'
import { ColdProblemStepView } from '../steps/ColdProblemStep'
import { GuidedSolveStepView } from '../steps/GuidedSolveStep'
import { SlotSelectStepView } from '../steps/SlotSelectStep'
import './LessonRunner.css'

type LessonRunnerProps = {
  lesson: Lesson
  progress: LessonProgress
  onProgressChange: (progress: LessonProgress) => void
  onLessonStart?: () => void
}

function stepKindLabel(type: Lesson['steps'][number]['type']): string {
  if (type === 'visual-interactive') return 'Build'
  if (type === 'rule-statement') return 'Rule'
  return 'Test'
}

export function LessonRunner({
  lesson,
  progress,
  onProgressChange,
  onLessonStart,
}: LessonRunnerProps) {
  const [started, setStarted] = useState(
    progress.currentStepIndex > 0 || progress.mastered !== null || !!progress.completedAt,
  )
  // Furthest step the learner has reached, so they can jump back and forward
  // through steps they've already seen without re-clearing each gate.
  const [furthestIndex, setFurthestIndex] = useState(progress.currentStepIndex)

  useEffect(() => {
    if (progress.currentStepIndex > 0 || progress.mastered !== null || progress.completedAt) {
      setStarted(true)
    }
  }, [progress.currentStepIndex, progress.mastered, progress.completedAt])

  useEffect(() => {
    setFurthestIndex((f) => Math.max(f, progress.currentStepIndex))
  }, [progress.currentStepIndex])

  const currentStep = lesson.steps[progress.currentStepIndex]

  const handleStepComplete = useCallback(() => {
    const nextIndex = progress.currentStepIndex + 1
    if (nextIndex >= lesson.steps.length) {
      onProgressChange({
        ...progress,
        currentStepIndex: nextIndex,
        completedAt: new Date().toISOString(),
      })
      return
    }

    onProgressChange({
      ...progress,
      currentStepIndex: nextIndex,
    })
  }, [lesson.steps.length, progress, onProgressChange])

  const handleColdComplete = useCallback(
    (mastered: boolean) => {
      onProgressChange({
        ...progress,
        currentStepIndex: lesson.steps.length,
        mastered,
        completedAt: new Date().toISOString(),
      })
    },
    [lesson.steps.length, progress, onProgressChange],
  )

  const handleStart = () => {
    setStarted(true)
    onLessonStart?.()
  }

  const handleReplay = useCallback(() => {
    setStarted(false)
    onProgressChange({
      currentStepIndex: 0,
      stepAnswers: {},
      mastered: null,
      completedAt: null,
    })
  }, [onProgressChange])

  const handleBack = useCallback(() => {
    if (progress.currentStepIndex === 0) return
    onProgressChange({
      ...progress,
      currentStepIndex: progress.currentStepIndex - 1,
      mastered: null,
      completedAt: null,
    })
  }, [progress, onProgressChange])

  const handleRestart = useCallback(() => {
    onProgressChange({
      currentStepIndex: 0,
      stepAnswers: {},
      mastered: null,
      completedAt: null,
    })
  }, [onProgressChange])

  const lastIndex = lesson.steps.length - 1

  const handleForward = useCallback(() => {
    const target = progress.currentStepIndex + 1
    if (target > furthestIndex || target > lastIndex) return
    onProgressChange({ ...progress, currentStepIndex: target })
  }, [progress, furthestIndex, lastIndex, onProgressChange])

  const handleJump = useCallback(
    (index: number) => {
      setFurthestIndex((f) => Math.max(f, index))
      onProgressChange({ ...progress, currentStepIndex: index, mastered: null, completedAt: null })
    },
    [progress, onProgressChange],
  )

  if (progress.mastered !== null && progress.completedAt) {
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
        <div className="lesson-runner__actions">
          <button type="button" className="lesson-runner__replay" onClick={handleReplay}>
            Replay lesson
          </button>
          {isLayerActive(4) && (
            <Link to="/" className="lesson-runner__course-link">
              Back to course path
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
        <div className="lesson-runner__actions">
          <button type="button" className="lesson-runner__replay" onClick={handleReplay}>
            Replay lesson
          </button>
          {isLayerActive(4) && (
            <Link to="/" className="lesson-runner__course-link">
              Back to course path
            </Link>
          )}
        </div>
      </div>
    )
  }

  const referenceStep = lesson.steps.find(
    (s): s is VisualInteractiveStep =>
      s.type === 'visual-interactive' &&
      currentStep.type === 'rule-statement' &&
      s.id === currentStep.referenceStepId,
  )

  return (
    <div className="lesson-runner">
      <div className="lesson-runner__topbar">
        {isLayerActive(4) ? (
          <Link to="/" className="lesson-runner__back-inline">
            ← Course path
          </Link>
        ) : (
          <span />
        )}
        <div className="lesson-runner__nav">
          <button
            type="button"
            className="lesson-runner__nav-btn"
            onClick={handleBack}
            disabled={progress.currentStepIndex === 0}
          >
            ← Back
          </button>
          <button
            type="button"
            className="lesson-runner__nav-btn"
            onClick={handleForward}
            disabled={progress.currentStepIndex >= Math.min(furthestIndex, lastIndex)}
          >
            Forward →
          </button>
          <button type="button" className="lesson-runner__nav-btn" onClick={handleRestart}>
            ↻ Restart
          </button>
        </div>
      </div>
      <div className="lesson-runner__header">
        <span className="lesson-runner__step-label">
          Step {currentStep.step} of {lesson.steps.length}
        </span>
        <div className="lesson-runner__progress-bar">
          <div
            className="lesson-runner__progress-fill"
            style={{ width: `${((currentStep.step - 1) / lesson.steps.length) * 100}%` }}
          />
        </div>
      </div>

      {import.meta.env.DEV && (
        <label className="lesson-runner__dev">
          <span className="lesson-runner__dev-tag">DEV</span>
          jump to
          <select
            className="lesson-runner__dev-select"
            value={progress.currentStepIndex}
            onChange={(e) => handleJump(Number(e.target.value))}
          >
            {lesson.steps.map((s, i) => (
              <option key={s.id} value={i}>
                Step {s.step} · {stepKindLabel(s.type)}
              </option>
            ))}
          </select>
        </label>
      )}

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

      {currentStep.type === 'slot-select' && (
        <SlotSelectStepView
          key={currentStep.id}
          step={currentStep}
          onComplete={handleStepComplete}
        />
      )}

      {currentStep.type === 'cold-problem' && (
        <ColdProblemStepView
          key={currentStep.id}
          step={currentStep}
          onComplete={handleColdComplete}
        />
      )}
    </div>
  )
}
