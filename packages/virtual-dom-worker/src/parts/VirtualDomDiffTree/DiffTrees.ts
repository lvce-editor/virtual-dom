import type { Patch } from '../Patch/Patch.ts'
import type * as VirtualDomTree from '../VirtualDomTree/VirtualDomTree.ts'
import * as PatchType from '../PatchType/PatchType.ts'
import * as AddNavigationPatches from './AddNavigationPatches.ts'
import * as CompareNodes from './CompareNodes.ts'

export const diffTrees = (
  oldTree: readonly VirtualDomTree.VirtualDomTreeNode[],
  newTree: readonly VirtualDomTree.VirtualDomTreeNode[],
  patches: Patch[],
  path: number[],
  currentPath: number[] = path,
): void => {
  const maxLength = Math.max(oldTree.length, newTree.length)

  for (let i = 0; i < maxLength; i++) {
    const oldNode = oldTree[i]
    const newNode = newTree[i]

    if (!oldNode && !newNode) {
      continue
    }

    if (!oldNode) {
      // Add new node
      AddNavigationPatches.addNavigationPatches(patches, path, i, currentPath)
      patches.push({
        type: PatchType.Add,
        nodes: [newNode.node],
      })
      if (newNode.children.length > 0) {
        const newChildPath = [...path, i]
        patches.push({
          type: PatchType.NavigateChild,
          index: 0,
        })
        diffTrees([], newNode.children, patches, newChildPath, newChildPath)
        patches.push({
          type: PatchType.NavigateParent,
        })
      }
    } else if (newNode) {
      // Compare nodes
      const nodePatches = CompareNodes.compareNodes(oldNode.node, newNode.node)
      console.log({ nodePatches, oldNode, newNode })
      if (nodePatches.length > 0) {
        AddNavigationPatches.addNavigationPatches(patches, path, i, currentPath)
        patches.push(...nodePatches)
      }

      // Compare children
      if (oldNode.children.length > 0 || newNode.children.length > 0) {
        const childPath = [...path, i]
        // Only add NavigateChild if we're not already at the parent
        // When we're at the root and navigating to the first child, we need to navigate
        // But when we're already at a node and navigating to its child, we also need to navigate
        // The key is: we always need to navigate to the child, so we add the patch
        patches.push({
          type: PatchType.NavigateChild,
          index: 0,
        })
        // After navigating to child, we're now at childPath
        // When comparing children, we're already at the correct position,
        // so we don't need to add navigation patches - we pass childPath as currentPath
        diffTrees(
          oldNode.children,
          newNode.children,
          patches,
          childPath,
          childPath,
        )
        patches.push({
          type: PatchType.NavigateParent,
        })
      }
    } else {
      console.log({ patches, path, i, currentPath })
      // Remove old node
      AddNavigationPatches.addNavigationPatches(patches, path, i, currentPath)
      // Navigate to parent to remove the child
      patches.push({
        type: PatchType.NavigateParent,
      })
      patches.push({
        type: PatchType.RemoveChild,
        index: i,
      })
    }
  }
}
