import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import type { VirtualDomTreeNode } from '../VirtualDomTree/VirtualDomTree.ts'

export const treeToArray = (
  node: VirtualDomTreeNode,
): readonly VirtualDomNode[] => {
  const result: VirtualDomNode[] = [node.node]
  for (const child of node.children) {
    result.push(...treeToArray(child))
  }
  return result
}
