import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'

export interface VirtualDomTreeNode {
  readonly children: readonly VirtualDomTreeNode[]
  readonly node: VirtualDomNode
}

interface ParseResult {
  readonly children: readonly VirtualDomTreeNode[]
  readonly nodesConsumed: number
}

export const arrayToTree = (
  nodes: readonly VirtualDomNode[],
): readonly VirtualDomTreeNode[] => {
  const result: VirtualDomTreeNode[] = []
  let i = 0

  while (i < nodes.length) {
    const node = nodes[i]
    const { children, nodesConsumed } = getChildrenWithCount(
      nodes,
      i + 1,
      node.childCount || 0,
    )
    result.push({
      node,
      children,
    })
    i += 1 + nodesConsumed
  }

  return result
}

const getChildrenWithCount = (
  nodes: readonly VirtualDomNode[],
  startIndex: number,
  childCount: number,
): ParseResult => {
  if (childCount === 0) {
    return { children: [], nodesConsumed: 0 }
  }

  const children: VirtualDomTreeNode[] = []
  let i = startIndex
  let remaining = childCount
  let totalConsumed = 0

  while (remaining > 0 && i < nodes.length) {
    const node = nodes[i]
    const nodeChildCount = node.childCount || 0
    const { children: nodeChildren, nodesConsumed } = getChildrenWithCount(
      nodes,
      i + 1,
      nodeChildCount,
    )

    children.push({
      node,
      children: nodeChildren,
    })

    const nodeSize = 1 + nodesConsumed
    i += nodeSize
    totalConsumed += nodeSize
    remaining--
  }

  return { children, nodesConsumed: totalConsumed }
}
