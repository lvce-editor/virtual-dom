import type { Patch } from '../Patch/Patch.ts'
import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'

const createTree = (nodes: readonly VirtualDomNode[]): any => {
  const max = nodes.length - 1
  let stack: VirtualDomNode[] = []
  for (let i = max; i >= 0; i--) {
    const element = nodes[i]
    const Element = { ...element, children: stack.slice(0, element.childCount) }
    stack = stack.slice(element.childCount)
    stack.unshift(Element)
  }
  const root = {
    type: 0,
    children: stack,
  }
  return root
}

export const diff = (
  oldNodes: readonly VirtualDomNode[],
  newNodes: readonly VirtualDomNode[],
): readonly Patch[] => {
  const a = createTree(oldNodes)
  const b = createTree(newNodes)
  const patches: Patch[] = []
  return patches
}
