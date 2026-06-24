import type { RuleStatementStep, VisualInteractiveStep } from '../../types/lesson'
import { TreeBuild } from '../tree/TreeBuild'
import './RuleStatementStep.css'

type RuleStatementStepProps = {
  step: RuleStatementStep
  referenceStep?: VisualInteractiveStep
  onComplete: () => void
}

export function RuleStatementStepView({
  step,
  referenceStep,
  onComplete,
}: RuleStatementStepProps) {
  const levels = referenceStep?.visual.treeConfig.levels

  return (
    <div className="rule-step">
      <p className="rule-step__explanation">{step.explanation}</p>
      {levels ? (
        <TreeBuild
          allLevels={levels}
          revealedSplitCount={levels.length}
          readOnly
          overlayExpression={step.overlayExpression}
        />
      ) : (
        step.overlayExpression && (
          <p className="rule-step__formula">{step.overlayExpression}</p>
        )
      )}
      <button type="button" className="rule-step__continue" onClick={onComplete}>
        Continue
      </button>
    </div>
  )
}
