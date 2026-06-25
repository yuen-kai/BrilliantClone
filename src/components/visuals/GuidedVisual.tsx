import type { GuidedVisual } from '../../types/lesson'
import { ComplementTree } from './ComplementTree'

export function GuidedVisualView({ visual }: { visual: GuidedVisual }) {
  switch (visual.component) {
    case 'complement-tree':
      return <ComplementTree config={{ rootLabel: visual.rootLabel, branches: visual.branches }} />
  }
}
