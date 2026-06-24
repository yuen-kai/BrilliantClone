import { describe, expect, it } from 'vitest'
import {
  buildTreeFromSplits,
  computeLayout,
  computeVisibleViewBox,
  NODE_RADIUS,
} from './treeLayout'

function rootDriftInViewBox(
  visibleSplitCount: number,
  splits: { branchCount: number }[],
) {
  const { nodes } = buildTreeFromSplits(splits)
  const layout = computeLayout(nodes, splits.length)
  const visible = nodes.filter((n) => n.level <= visibleSplitCount)
  const vb = computeVisibleViewBox(visible, layout.positions)
  const root = layout.positions.get('root')!
  const rootScreenX = root.x - vb.x
  return Math.abs(rootScreenX - vb.width / 2)
}

describe('computeLayout centering', () => {
  it('centers root in visible viewBox after first split', () => {
    const splits = [{ branchCount: 2 }, { branchCount: 3 }, { branchCount: 2 }]
    expect(rootDriftInViewBox(1, splits)).toBeLessThan(2)
  })

  it('centers root in visible viewBox for full sandwich tree', () => {
    const splits = [{ branchCount: 2 }, { branchCount: 3 }, { branchCount: 2 }]
    expect(rootDriftInViewBox(3, splits)).toBeLessThan(2)
  })

  it('centers single root node', () => {
    const { nodes } = buildTreeFromSplits([])
    const layout = computeLayout(nodes, 3)
    const vb = computeVisibleViewBox(nodes, layout.positions)
    const root = layout.positions.get('root')!
    expect(Math.abs(root.x - vb.x - vb.width / 2)).toBeLessThan(2)
  })
})

describe('node sizing', () => {
  it('uses readable node radius', () => {
    expect(NODE_RADIUS).toBeGreaterThanOrEqual(12)
    expect(NODE_RADIUS).toBeLessThanOrEqual(16)
  })
})
