import type { GuidedVisual } from '../../types/lesson'
import { RoundTable } from './RoundTable'
import { DuplicateRow } from './DuplicateRow'
import { ComplementDots } from './ComplementDots'
import { StarsBars } from './StarsBars'

export function GuidedVisualView({ visual }: { visual: GuidedVisual }) {
  switch (visual.component) {
    case 'round-table':
      return <RoundTable seats={visual.seats} />
    case 'duplicate-row':
      return <DuplicateRow tiles={visual.tiles} word={visual.word} />
    case 'complement-dots':
      return (
        <ComplementDots
          total={visual.total}
          unwanted={visual.unwanted}
          wantedLabel={visual.wantedLabel}
          unwantedLabel={visual.unwantedLabel}
        />
      )
    case 'stars-bars':
      return (
        <StarsBars stars={visual.stars} bars={visual.bars} groupNoun={visual.groupNoun} />
      )
  }
}
