import type { MechanismTreeConfig } from '../../types/lesson'

// STUB — replaced by the L6 tap-to-grow mechanism decision tree.
export function MechanismTree({
  config,
  onSolved,
}: {
  config: MechanismTreeConfig
  onSolved?: () => void
}) {
  return (
    <div className="rxn-stub">
      <p className="rxn-stub__note">{config.caption ?? 'Grow the decision tree.'}</p>
      <button type="button" className="rxn-stub__btn" onClick={() => onSolved?.()}>
        Grow the tree
      </button>
    </div>
  )
}
