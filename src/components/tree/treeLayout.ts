export type TreeNode = {
  id: string
  level: number
  index: number
  parentId: string | null
}

export type TreeEdge = {
  from: string
  to: string
  multiplierLabel?: string
}

export type TreeLayout = {
  nodes: TreeNode[]
  edges: TreeEdge[]
  positions: Map<string, { x: number; y: number }>
  width: number
  height: number
}

export type ViewBox = {
  x: number
  y: number
  width: number
  height: number
}

const NODE_RADIUS = 14
const LEVEL_HEIGHT = 54
// Center-to-center spacing for leaves. Must stay above the node diameter (28)
// so wide levels never overlap; the SVG scales the whole thing to fit width.
const MIN_LEAF_GAP = 34
const H_PADDING = 16
const V_PADDING = 12
const VIEW_PADDING = 14

export function buildTreeFromSplits(
  splits: { branchCount: number; multiplierLabel?: string }[],
): { nodes: TreeNode[]; edges: TreeEdge[] } {
  const nodes: TreeNode[] = [{ id: 'root', level: 0, index: 0, parentId: null }]
  const edges: TreeEdge[] = []
  let nodeCounter = 0

  let currentLevelNodes = [nodes[0]!]

  for (let splitIndex = 0; splitIndex < splits.length; splitIndex++) {
    const split = splits[splitIndex]!
    const nextLevelNodes: TreeNode[] = []

    for (const parent of currentLevelNodes) {
      for (let b = 0; b < split.branchCount; b++) {
        nodeCounter++
        const child: TreeNode = {
          id: `n-${nodeCounter}`,
          level: splitIndex + 1,
          index: b,
          parentId: parent.id,
        }
        nodes.push(child)
        nextLevelNodes.push(child)
        edges.push({
          from: parent.id,
          to: child.id,
          multiplierLabel: b === 0 ? split.multiplierLabel : undefined,
        })
      }
    }

    currentLevelNodes = nextLevelNodes
  }

  return { nodes, edges }
}

export function computeLayout(nodes: TreeNode[], totalLevels?: number): TreeLayout {
  const positions = new Map<string, { x: number; y: number }>()

  if (nodes.length === 0) {
    return { nodes, edges: [], positions, width: 200, height: 80 }
  }

  const maxLevel = Math.max(...nodes.map((n) => n.level))
  const levelCount = totalLevels ?? maxLevel
  const childrenOf = new Map<string, TreeNode[]>()

  for (const node of nodes) {
    if (node.parentId) {
      const kids = childrenOf.get(node.parentId) ?? []
      kids.push(node)
      childrenOf.set(node.parentId, kids)
    }
  }

  for (const kids of childrenOf.values()) {
    kids.sort((a, b) => a.index - b.index)
  }

  const root = nodes.find((n) => n.parentId === null)!
  const leafCount = nodes.filter((n) => n.level === maxLevel).length

  const gap = leafCount <= 1 ? 0 : MIN_LEAF_GAP

  let leafCounter = 0

  function layoutNode(node: TreeNode): number {
    const children = childrenOf.get(node.id) ?? []
    let x: number

    if (children.length === 0) {
      x = H_PADDING + NODE_RADIUS + leafCounter * gap
      leafCounter++
    } else {
      const childXs = children.map(layoutNode)
      x = (childXs[0]! + childXs[childXs.length - 1]!) / 2
    }

    positions.set(node.id, { x, y: 0 })
    return x
  }

  layoutNode(root)

  for (const [id, pos] of positions) {
    const node = nodes.find((n) => n.id === id)!
    const y = V_PADDING + node.level * LEVEL_HEIGHT + NODE_RADIUS
    positions.set(id, { x: pos.x, y })
  }

  const coords = [...positions.values()]
  const minX = Math.min(...coords.map((p) => p.x)) - NODE_RADIUS
  const maxX = Math.max(...coords.map((p) => p.x)) + NODE_RADIUS

  const contentWidth = maxX - minX
  const width = contentWidth + H_PADDING * 2
  const height = V_PADDING * 2 + levelCount * LEVEL_HEIGHT + NODE_RADIUS * 2

  const offsetX = (width - contentWidth) / 2 - minX

  for (const [id, pos] of positions) {
    positions.set(id, { x: pos.x + offsetX, y: pos.y })
  }

  return { nodes, edges: [], positions, width, height }
}

/** Crop viewBox to visible nodes so the tree fills the frame and stays centered */
export function computeVisibleViewBox(
  visibleNodes: TreeNode[],
  positions: Map<string, { x: number; y: number }>,
): ViewBox {
  if (visibleNodes.length === 0) {
    return { x: 0, y: 0, width: 200, height: 80 }
  }

  const coords = visibleNodes
    .map((n) => positions.get(n.id))
    .filter((p): p is { x: number; y: number } => p !== undefined)

  let minX = Math.min(...coords.map((p) => p.x)) - NODE_RADIUS - VIEW_PADDING
  let maxX = Math.max(...coords.map((p) => p.x)) + NODE_RADIUS + VIEW_PADDING
  let minY = Math.min(...coords.map((p) => p.y)) - NODE_RADIUS - VIEW_PADDING
  let maxY = Math.max(...coords.map((p) => p.y)) + NODE_RADIUS + VIEW_PADDING

  let width = maxX - minX
  let height = maxY - minY
  const minWidth = 80
  const minHeight = 60

  if (width < minWidth) {
    const pad = (minWidth - width) / 2
    minX -= pad
    maxX += pad
    width = minWidth
  }

  if (height < minHeight) {
    const pad = (minHeight - height) / 2
    minY -= pad
    maxY += pad
    height = minHeight
  }

  return { x: minX, y: minY, width, height }
}

export function edgePath(
  from: { x: number; y: number },
  to: { x: number; y: number },
): string {
  const midY = (from.y + to.y) / 2
  return `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`
}

export { NODE_RADIUS, LEVEL_HEIGHT }
