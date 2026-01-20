import type { Patch } from '../Patch/Patch.ts'
import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import * as VirtualDomTree from '../VirtualDomTree/VirtualDomTree.ts'
import * as DiffTrees from './DiffTrees.ts'
import * as RemoveTrailingNavigationPatches from './RemoveTrailingNavigationPatches.ts'

export const diffTree = (
  oldNodes: readonly VirtualDomNode[],
  newNodes: readonly VirtualDomNode[],
): readonly Patch[] => {
  // Step 1: Convert flat arrays to tree structures
  const oldTree = VirtualDomTree.arrayToTree(oldNodes)
  const newTree = VirtualDomTree.arrayToTree(newNodes)

  // Step 2: Add fake root nodes to both trees
  // const oldRoot = { node: { type: 0, childCount: oldTree.length }, children: oldTree }
  // const newRoot = { node: { type: 0, childCount: newTree.length }, children: newTree }

  // Step 3: Compare the trees
  const patches: Patch[] = []
  DiffTrees.diffTrees(oldTree, newTree, patches, [])

  // Remove trailing navigation patches since they serve no purpose
  return RemoveTrailingNavigationPatches.removeTrailingNavigationPatches(
    patches,
  )
}
