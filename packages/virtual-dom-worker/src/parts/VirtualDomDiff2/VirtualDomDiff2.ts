import { createTree } from '../CreateTree/CreateTree.ts'
import type { Patch } from '../Patch/Patch.ts'
import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'

export const diff2 = (
  oldNodes: readonly VirtualDomNode[],
  newNodes: readonly VirtualDomNode[],
): readonly Patch[] => {
  const a = createTree(oldNodes)
  const b = createTree(newNodes)
  console.log({ a, b })
  const patches: Patch[] = []
  return patches
}
