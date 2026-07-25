import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import type { VirtualDomTreeNode } from '../VirtualDomTree/VirtualDomTree.ts'

export const treeToArray = (
  node: VirtualDomTreeNode,
): readonly VirtualDomNode[] => {
  const result: VirtualDomNode[] = []
  const stack: VirtualDomTreeNode[] = [node]
  while (stack.length > 0) {
    const current = stack.pop()!
    result.push(current.node)
    for (let i = current.children.length - 1; i >= 0; i--) {
      stack.push(current.children[i])
    }
  }
  return result
}
