import { createContext, useContext } from 'react'
import type { Op } from '../../lib/mathExpr'

/** Fundamental operators allowed everywhere, at every level. Advanced ops
 * (!, C, P) become available by level — see allowedOpsForLevel. */
export const BASIC_OPS: ReadonlySet<Op> = new Set(['+', '-', '*', '/'])

/**
 * Operators available at a given course level (a lesson's `order`). Locking is
 * tied to the level, not to finishing a particular step, so skipping ahead to a
 * later level still grants the right operators.
 *   - Level 1 (Multiplication): basic arithmetic only.
 *   - Level 2 (Permutations & Combinations): adds `!`, the tool you write the
 *     formula with, but `P` and `C` stay locked for the whole level since this is
 *     where you learn them (you do them the long way).
 *   - Level 3+: everything, including the `P` and `C` shortcuts you've earned.
 */
export function allowedOpsForLevel(order: number): Set<Op> {
  const ops = new Set<Op>(BASIC_OPS)
  if (order >= 2) ops.add('!')
  if (order >= 3) {
    ops.add('P')
    ops.add('C')
  }
  return ops
}

/** Operators that become newly available once the learner moves past `order`
 * (available at order + 1 but not at `order`). Used to announce new tools on a
 * lesson's completion screen. In practice only !, P and C ever appear here. */
export function newlyUnlockedAfterLevel(order: number): Op[] {
  const current = allowedOpsForLevel(order)
  return [...allowedOpsForLevel(order + 1)].filter((op) => !current.has(op))
}

/** Operators a GateInput may currently accept. Defaults to the BASIC set so a
 * GateInput with no provider (e.g. in unit tests) still locks !, C and P. */
export const AllowedOpsContext = createContext<Set<Op>>(new Set(BASIC_OPS))

export function useAllowedOps(): Set<Op> {
  return useContext(AllowedOpsContext)
}
