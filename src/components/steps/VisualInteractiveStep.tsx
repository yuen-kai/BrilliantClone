import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import type { StageGate, TreeLevel, VisualInteractiveStep } from '../../types/lesson'
import { resolveFeedback } from '../../lib/feedback'
import { validateStageGate } from '../../lib/lessonEngine'
import { useTreeBuild } from '../../hooks/useTreeBuild'
import { TreeBuild } from '../tree/TreeBuild'
import { GateInput } from '../lesson/GateInput'
import { FeedbackBanner } from '../lesson/FeedbackBanner'
import './VisualInteractiveStep.css'

type Phase = 'predict-branches' | 'splitting' | 'count-nodes' | 'final' | 'done'

type VisualInteractiveStepProps = {
  step: VisualInteractiveStep
  onComplete: () => void
  initialStageIndex?: number
}

function phaseForStage(stage: StageGate | undefined): Phase {
  return stage?.kind === 'dual' ? 'predict-branches' : 'splitting'
}

export function VisualInteractiveStepView({
  step,
  onComplete,
  initialStageIndex = 0,
}: VisualInteractiveStepProps) {
  const levels = step.visual.treeConfig.levels
  const { completedSplits, canSplit, allSplitsDone, animating, triggerSplit } =
    useTreeBuild(levels)

  const [stageIndex, setStageIndex] = useState(initialStageIndex)
  const [phase, setPhase] = useState<Phase>(() => phaseForStage(step.stages[initialStageIndex]))
  const [feedback, setFeedback] = useState<{ message: string; variant: 'correct' | 'wrong' | 'hint' } | null>(null)
  const [confirmedCount, setConfirmedCount] = useState(initialStageIndex)
  const [predictedMultiplier, setPredictedMultiplier] = useState<number | null>(null)
  // Bumped on every wrong answer so the active input refocuses + selects itself.
  const [errorNonce, setErrorNonce] = useState(0)

  const currentStage = step.stages[stageIndex]

  // Running node count at each level: 1 → b0 → b0·b1 → …
  const nodeCounts = useMemo(() => {
    let running = 1
    return levels.map((level) => {
      running *= level.branchCount
      return running
    })
  }, [levels])

  // Show only the hint on a wrong answer; the explanatory text is a no-hint fallback.
  const showWrong = useCallback(
    (message: string) => {
      setErrorNonce((n) => n + 1)
      setFeedback(
        step.hintText ? { message: step.hintText, variant: 'hint' } : { message, variant: 'wrong' },
      )
    },
    [step.hintText],
  )

  const advanceAfterCount = useCallback(() => {
    setConfirmedCount((c) => Math.max(c, stageIndex + 1))
    if (stageIndex < step.stages.length - 1) {
      setTimeout(() => {
        const next = stageIndex + 1
        setStageIndex(next)
        setPhase(phaseForStage(step.stages[next]))
        setPredictedMultiplier(null)
        setFeedback(null)
      }, 600)
    } else {
      setTimeout(() => {
        setPhase('final')
        setFeedback(null)
      }, 600)
    }
  }, [stageIndex, step.stages])

  // Node-count steps: tap (or press Enter) to split, then count.
  const handleSplit = useCallback(() => {
    if (!canSplit) return
    triggerSplit()
    setTimeout(() => setPhase('count-nodes'), 450)
  }, [canSplit, triggerSplit])

  useEffect(() => {
    if (phase !== 'splitting') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSplit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, handleSplit])

  // Dual steps: predict the branch count first, then watch the split happen.
  const handleBranchesPredict = (value: number) => {
    if (!currentStage || currentStage.kind !== 'dual') return
    if (value === currentStage.expectedMultiplier) {
      setPredictedMultiplier(value)
      setFeedback({ message: 'Right, watch each node split.', variant: 'correct' })
      triggerSplit()
      setTimeout(() => {
        setPhase('count-nodes')
        setFeedback(null)
      }, 600)
    } else {
      showWrong(resolveFeedback(value, step.feedbackWrong))
    }
  }

  const handleNodeCountSubmit = (value: number) => {
    if (!currentStage) return
    const answers =
      currentStage.kind === 'dual'
        ? { multiplier: predictedMultiplier ?? undefined, nodeCount: value }
        : { nodeCount: value }

    if (validateStageGate(currentStage, answers)) {
      setFeedback({ message: 'Correct!', variant: 'correct' })
      advanceAfterCount()
    } else {
      showWrong(resolveFeedback(value, step.feedbackWrong))
    }
  }

  const handleFinalSubmit = (value: number) => {
    if (value === step.finalGate.correctValue) {
      setFeedback({ message: 'Correct! You found the total.', variant: 'correct' })
      setPhase('done')
      setTimeout(onComplete, 800)
    } else {
      setErrorNonce((n) => n + 1)
      setFeedback(
        step.finalGate.hintText
          ? { message: step.finalGate.hintText, variant: 'hint' }
          : { message: resolveFeedback(value, step.finalGate.feedbackWrong), variant: 'wrong' },
      )
    }
  }

  const showSplitButton =
    phase === 'splitting' && !allSplitsDone && stageIndex === completedSplits.length

  return (
    <div className="visual-step">
      <p className="visual-step__prompt">{step.prompt}</p>

      <div className="visual-step__stage">
        <TreeBuild allLevels={levels} revealedSplitCount={completedSplits.length} />
        <CountRail
          levels={levels}
          nodeCounts={nodeCounts}
          confirmedCount={confirmedCount}
          currentIndex={stageIndex}
          phase={phase}
          onCountSubmit={handleNodeCountSubmit}
          errorNonce={errorNonce}
        />
      </div>

      <p className="visual-step__legend">
        <span className="visual-step__legend-dot" aria-hidden="true" />
        Each <strong>node</strong> (circle) is one combination so far; the bottom row is every
        complete one.
      </p>

      <div className="visual-step__controls">
        {showSplitButton && (
          <button
            type="button"
            className="visual-step__next-btn"
            onClick={handleSplit}
            disabled={animating}
            autoFocus
          >
            {completedSplits.length === 0 ? 'Start: split first choice' : 'Next: split again'}
          </button>
        )}

        {phase === 'predict-branches' && (
          <GateInput
            label="How many branches will each node split into?"
            onSubmit={handleBranchesPredict}
            errorNonce={errorNonce}
          />
        )}

        {phase === 'count-nodes' && (
          <p className="visual-step__hint">Enter the total node count for the highlighted level →</p>
        )}

        {phase === 'final' && (
          <GateInput label={step.finalGate.prompt} onSubmit={handleFinalSubmit} errorNonce={errorNonce} />
        )}

        {feedback && <FeedbackBanner message={feedback.message} variant={feedback.variant} />}
      </div>
    </div>
  )
}

function CountRail({
  levels,
  nodeCounts,
  confirmedCount,
  currentIndex,
  phase,
  onCountSubmit,
  errorNonce,
}: {
  levels: TreeLevel[]
  nodeCounts: number[]
  confirmedCount: number
  currentIndex: number
  phase: Phase
  onCountSubmit: (value: number) => void
  errorNonce: number
}) {
  const active = phase !== 'final' && phase !== 'done'

  return (
    <div className="count-rail-wrap">
      <p className="count-rail__caption">Combinations so far</p>
      <ol className="count-rail" aria-label="Running total of combinations at each level">
        <li className="count-rail__step count-rail__step--start">
          <span className="count-rail__name">Start</span>
          <span className="count-rail__total">1</span>
        </li>
        {levels.map((level, i) => {
          const confirmed = i < confirmedCount
          const current = active && !confirmed && i === currentIndex
          const counting = current && phase === 'count-nodes'
          // Reveal the level's multiplier (×N) as soon as the split happens, so the
          // student sees the operation before entering the running total.
          const showOp = confirmed || counting
          // Running product up to this level, e.g. "3 × 2", makes it obvious the
          // total counts every choice above, not just this level's options.
          const runningExpr = levels
            .slice(0, i + 1)
            .map((l) => l.branchCount)
            .join(' × ')

          const stepClass = [
            'count-rail__step',
            confirmed ? 'is-confirmed' : '',
            current ? 'is-current' : '',
            counting ? 'is-counting' : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <Fragment key={level.label}>
              <li className={`count-rail__op ${showOp ? 'is-shown' : ''}`} aria-hidden={!showOp}>
                <span>×{level.branchCount}</span>
              </li>
              <li className={stepClass}>
                <span className="count-rail__label">
                  <span className="count-rail__name">{level.label}</span>
                  {showOp && i > 0 && (
                    <span className="count-rail__expr">{runningExpr}</span>
                  )}
                </span>
                {confirmed ? (
                  <span className="count-rail__total">{nodeCounts[i]}</span>
                ) : counting ? (
                  <RailCountInput onSubmit={onCountSubmit} errorNonce={errorNonce} />
                ) : (
                  <span className="count-rail__total count-rail__total--pending">
                    {current ? '?' : ''}
                  </span>
                )}
              </li>
            </Fragment>
          )
        })}
      </ol>
    </div>
  )
}

function RailCountInput({
  onSubmit,
  errorNonce,
}: {
  onSubmit: (value: number) => void
  errorNonce: number
}) {
  const [value, setValue] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (errorNonce > 0) {
      ref.current?.focus()
      ref.current?.select()
    }
  }, [errorNonce])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const n = parseInt(value, 10)
    if (!Number.isNaN(n)) onSubmit(n)
  }

  return (
    <form className="count-rail__input-form" onSubmit={handleSubmit}>
      <input
        ref={ref}
        className="count-rail__input"
        type="number"
        inputMode="numeric"
        min={0}
        aria-label="How many nodes at this level?"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
      />
      <button type="submit" className="count-rail__check" aria-label="Check" disabled={!value}>
        ✓
      </button>
    </form>
  )
}
