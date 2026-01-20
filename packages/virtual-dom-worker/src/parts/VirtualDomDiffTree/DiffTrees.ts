import type { Patch } from '../Patch/Patch.ts'
import type * as VirtualDomTree from '../VirtualDomTree/VirtualDomTree.ts'
import * as PatchType from '../PatchType/PatchType.ts'
import * as CompareNodes from './CompareNodes.ts'
import * as TreeToArray from './TreeToArray.ts'

const diffChildren = (
  oldChildren: readonly VirtualDomTree.VirtualDomTreeNode[],
  newChildren: readonly VirtualDomTree.VirtualDomTreeNode[],
  patches: Patch[],
): void => {
  const maxLength = Math.max(oldChildren.length, newChildren.length)
  // Track where we are: -1 means at parent, >= 0 means at child index
  let currentChildIndex = -1

  for (let i = 0; i < maxLength; i++) {
    const oldNode = oldChildren[i]
    const newNode = newChildren[i]

    if (!oldNode && !newNode) {
      continue
    }

    if (!oldNode) {
      // Add new node - we should be at the parent
      if (currentChildIndex >= 0) {
        // Navigate back to parent
        patches.push({
          type: PatchType.NavigateParent,
        })
        currentChildIndex = -1
      }
      // Flatten the entire subtree so renderInternal can handle it
      const flatNodes = TreeToArray.treeToArray(newNode)
      patches.push({
        type: PatchType.Add,
        nodes: flatNodes,
      })
    } else if (newNode) {
      // Navigate to this child if not already there
      if (currentChildIndex === -1) {
        patches.push({
          type: PatchType.NavigateChild,
          index: i,
        })
        currentChildIndex = i
      } else if (currentChildIndex !== i) {
        patches.push({
          type: PatchType.NavigateSibling,
          index: i,
        })
        currentChildIndex = i
      }

      // Compare nodes
      const nodePatches = CompareNodes.compareNodes(oldNode.node, newNode.node)
      if (nodePatches.length > 0) {
        patches.push(...nodePatches)
      }

      // Compare children recursively
      if (oldNode.children.length > 0 || newNode.children.length > 0) {
        // Navigate to first child
        patches.push({
          type: PatchType.NavigateChild,
          index: 0,
        })
        diffChildren(oldNode.children, newNode.children, patches)
        // Navigate back to current node
        patches.push({
          type: PatchType.NavigateParent,
        })
      }
    } else {
      // Remove old node - navigate to parent if needed
      if (currentChildIndex >= 0) {
        patches.push({
          type: PatchType.NavigateParent,
        })
        currentChildIndex = -1
      }
      patches.push({
        type: PatchType.RemoveChild,
        index: i,
      })
    }
  }

  // Navigate back to parent if we ended at a child
  if (currentChildIndex >= 0) {
    patches.push({
      type: PatchType.NavigateParent,
    })
  }
}

export const diffTrees = (
  oldTree: readonly VirtualDomTree.VirtualDomTreeNode[],
  newTree: readonly VirtualDomTree.VirtualDomTreeNode[],
  patches: Patch[],
  path: number[],
): void => {
  // At the root level (path.length === 0), we're already AT the element
  // So we compare the root node directly, then compare its children
  if (path.length === 0 && oldTree.length === 1 && newTree.length === 1) {
    const oldNode = oldTree[0]
    const newNode = newTree[0]

    // Compare root nodes
    const nodePatches = CompareNodes.compareNodes(oldNode.node, newNode.node)
    if (nodePatches.length > 0) {
      patches.push(...nodePatches)
    }

    // Compare children
    if (oldNode.children.length > 0 || newNode.children.length > 0) {
      diffChildren(oldNode.children, newNode.children, patches)
    }
  } else {
    // Non-root level or multiple root elements - use the regular comparison
    diffChildren(oldTree, newTree, patches)
  }
}
