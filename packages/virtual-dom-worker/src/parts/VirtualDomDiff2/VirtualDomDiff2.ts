import { createTree } from '../CreateTree/CreateTree.ts'
import type { Patch } from '../Patch/Patch.ts'
import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'

export const diff = (
  oldNodes: readonly VirtualDomNode[],
  newNodes: readonly VirtualDomNode[],
): readonly Patch[] => {
  const a = createTree(oldNodes)
  const b = createTree(newNodes)
  const patches: Patch[] = []
  return patches
}
