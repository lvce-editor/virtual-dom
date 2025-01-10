import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'

export const getTotalChildCount = (
  nodes: readonly VirtualDomNode[],
  index: number,
): number => {
  let i = index
  let pending = 1
  while (pending) {
    const node = nodes[i]
    pending += node.childCount
    pending--
    i++
  }
  return i - index
}
