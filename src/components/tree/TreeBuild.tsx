import { useMemo } from 'react'
import type { TreeLevel } from '../../types/lesson'
import {
  buildTreeFromSplits,
  computeLayout,
  computeVisibleViewBox,
  edgePath,
  NODE_RADIUS,
  type TreeEdge,
  type TreeNode,
} from './treeLayout'
import './TreeBuild.css'

type TreeBuildProps = {
  allLevels: TreeLevel[]
  revealedSplitCount: number
  readOnly?: boolean
  overlayExpression?: string
}

function splitsFromLevels(levels: TreeLevel[]) {
  return levels.map((level) => ({
    branchCount: level.branchCount,
    multiplierLabel: `×${level.branchCount}`,
  }))
}

export function TreeBuild({
  allLevels,
  revealedSplitCount,
  readOnly = false,
  overlayExpression,
}: TreeBuildProps) {
  const allSplits = splitsFromLevels(allLevels)

  const { nodes, edges, layout, viewBox } = useMemo(() => {
    const built = buildTreeFromSplits(allSplits)
    const layoutResult = computeLayout(built.nodes, allLevels.length)
    const maxVisibleLevel = readOnly ? allLevels.length : revealedSplitCount
    const visibleNodes = built.nodes.filter((n) => n.level <= maxVisibleLevel)
    const vb = computeVisibleViewBox(visibleNodes, layoutResult.positions)
    return {
      nodes: built.nodes,
      edges: built.edges,
      layout: layoutResult,
      viewBox: vb,
    }
  }, [allSplits, allLevels.length, revealedSplitCount, readOnly])

  const positions = layout.positions
  const maxVisibleLevel = readOnly ? allLevels.length : revealedSplitCount

  const visibleNodes = nodes.filter((n) => n.level <= maxVisibleLevel)
  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id))
  const visibleEdges = edges.filter(
    (e) => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to),
  )

  return (
    <div className={`tree-build ${readOnly ? 'tree-build--readonly' : ''}`}>
      <svg
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        preserveAspectRatio="xMidYMid meet"
        className="tree-build__svg"
        role="img"
        aria-label="Decision tree"
      >
        <g className="tree-build__edges">
          {visibleEdges.map((edge: TreeEdge) => {
            const from = positions.get(edge.from)
            const to = positions.get(edge.to)
            if (!from || !to) return null
            return (
              <g key={`${edge.from}-${edge.to}`} className="tree-build__edge-group">
                <path d={edgePath(from, to)} className="tree-build__edge" />
                {edge.multiplierLabel && (
                  <text
                    x={(from.x + to.x) / 2}
                    y={(from.y + to.y) / 2 - 4}
                    className="tree-build__multiplier"
                  >
                    {edge.multiplierLabel}
                  </text>
                )}
              </g>
            )
          })}
        </g>
        <g className="tree-build__nodes">
          {visibleNodes.map((node: TreeNode) => {
            const pos = positions.get(node.id)
            if (!pos) return null
            const isNew = !readOnly && node.level === maxVisibleLevel && revealedSplitCount > 0
            return (
              <g
                key={node.id}
                className={`tree-build__node ${isNew ? 'tree-build__node--new' : ''}`}
                transform={`translate(${pos.x}, ${pos.y})`}
              >
                <circle r={NODE_RADIUS} className="tree-build__node-circle" />
              </g>
            )
          })}
        </g>
        {overlayExpression && (
          <text
            x={viewBox.x + viewBox.width / 2}
            y={viewBox.y + viewBox.height - 6}
            className="tree-build__overlay"
            textAnchor="middle"
          >
            {overlayExpression}
          </text>
        )}
      </svg>
    </div>
  )
}
