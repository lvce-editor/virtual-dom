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
      AddNavigationPatches.addNavigationPatches(patches, path, i)
      patches.push({
        type: PatchType.Add,
        nodes: [newNode.node],
      })
      if (newNode.children.length > 0) {
        patches.push({
          type: PatchType.NavigateChild,
          index: 0,
        })
        diffTrees([], newNode.children, patches, [...path, 0])
        patches.push({
          type: PatchType.NavigateParent,
        })
      }
    } else if (newNode) {
      // Compare nodes
      const nodePatches = CompareNodes.compareNodes(oldNode.node, newNode.node)
      if (nodePatches.length > 0) {
        AddNavigationPatches.addNavigationPatches(patches, path, i)
        patches.push(...nodePatches)
      }

      // Compare children
      if (oldNode.children.length > 0 || newNode.children.length > 0) {
        patches.push({
          type: PatchType.NavigateChild,
          index: 0,
        })
        diffTrees(oldNode.children, newNode.children, patches, [...path, 0])
        patches.push({
          type: PatchType.NavigateParent,
        })
      }
    } else {
      // Remove old node
      AddNavigationPatches.addNavigationPatches(patches, path, i)
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
