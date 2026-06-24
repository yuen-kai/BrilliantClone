import { useCallback, useMemo, useState } from 'react'
import type { TreeLevel } from '../types/lesson'

export type SplitState = {
  branchCount: number
  multiplierLabel?: string
}

export function useTreeBuild(levels: TreeLevel[]) {
  const [splitIndex, setSplitIndex] = useState(-1)
  const [animating, setAnimating] = useState(false)

  const completedSplits = useMemo(() => {
    if (splitIndex < 0) return [] as SplitState[]
    return levels.slice(0, splitIndex + 1).map((level) => ({
      branchCount: level.branchCount,
      multiplierLabel: `×${level.branchCount}`,
    }))
  }, [levels, splitIndex])

  const canSplit = splitIndex < levels.length - 1 && !animating
  const allSplitsDone = splitIndex >= levels.length - 1

  const triggerSplit = useCallback(() => {
    if (!canSplit) return
    setAnimating(true)
    setSplitIndex((prev) => prev + 1)
    setTimeout(() => setAnimating(false), 400)
  }, [canSplit])

  const reset = useCallback(() => {
    setSplitIndex(-1)
    setAnimating(false)
  }, [])

  return {
    splitIndex,
    completedSplits,
    canSplit,
    allSplitsDone,
    animating,
    triggerSplit,
    reset,
  }
}
