import type { Patch } from '../Patch/Patch.ts'
import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import { diffFlatTrees } from './DiffFlatTrees.ts'
import * as RemoveTrailingNavigationPatches from './RemoveTrailingNavigationPatches.ts'

export const diffTree = (
  oldNodes: readonly VirtualDomNode[],
  newNodes: readonly VirtualDomNode[],
): readonly Patch[] => {
  const patches: Patch[] = []
  diffFlatTrees(oldNodes, newNodes, patches)

  // Remove trailing navigation patches since they serve no purpose
  return RemoveTrailingNavigationPatches.removeTrailingNavigationPatches(
    patches,
  )
}
