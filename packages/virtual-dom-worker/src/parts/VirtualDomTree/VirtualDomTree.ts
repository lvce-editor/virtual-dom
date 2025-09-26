import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'

export interface VirtualDomTreeNode {
  readonly node: VirtualDomNode
  readonly children: readonly VirtualDomTreeNode[]
}

export const arrayToTree = (nodes: readonly VirtualDomNode[]): readonly VirtualDomTreeNode[] => {
  const result: VirtualDomTreeNode[] = []
  let i = 0
  
  while (i < nodes.length) {
    const node = nodes[i]
    const children = getChildren(nodes, i + 1, node.childCount || 0)
    result.push({
      node,
      children,
    })
    i += 1 + (node.childCount || 0)
  }
  
  return result
}

const getChildren = (
  nodes: readonly VirtualDomNode[],
  startIndex: number,
  childCount: number,
): readonly VirtualDomTreeNode[] => {
  if (childCount === 0) {
    return []
  }
  
  const children: VirtualDomTreeNode[] = []
  let i = startIndex
  let remaining = childCount
  
  while (remaining > 0 && i < nodes.length) {
    const node = nodes[i]
    const nodeChildCount = node.childCount || 0
    const nodeChildren = getChildren(nodes, i + 1, nodeChildCount)
    
    children.push({
      node,
      children: nodeChildren,
    })
    
    i += 1 + nodeChildCount
    remaining--
  }
  
  return children
}
