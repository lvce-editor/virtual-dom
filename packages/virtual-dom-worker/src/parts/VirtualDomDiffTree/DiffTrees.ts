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
  // Collect indices of children to remove (we'll add these patches at the end in reverse order)
  const indicesToRemove: number[] = []

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
      // Compare nodes to see if we need any patches
      const nodePatches = CompareNodes.compareNodes(oldNode.node, newNode.node)

      // If nodePatches is null, the node types are incompatible - need to replace
      if (nodePatches === null) {
        // Navigate to this child
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

        // Replace the entire subtree
        const flatNodes = TreeToArray.treeToArray(newNode)
        patches.push({
          type: PatchType.Replace,
          nodes: flatNodes,
        })
        // After replace, we're at the new element (same position)
        continue
      }

      // Check if we need to recurse into children
      const hasChildrenToCompare =
        oldNode.children.length > 0 || newNode.children.length > 0

      // Only navigate to this element if we need to do something
      if (nodePatches.length > 0 || hasChildrenToCompare) {
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

        // Apply node patches (these apply to the current element, not children)
        if (nodePatches.length > 0) {
          patches.push(...nodePatches)
        }

        // Compare children recursively
        if (hasChildrenToCompare) {
          diffChildren(oldNode.children, newNode.children, patches)
        }
      }
    } else {
      // Remove old node - collect the index for later removal
      indicesToRemove.push(i)
    }
  }

  // Navigate back to parent if we ended at a child
  if (currentChildIndex >= 0) {
    patches.push({
      type: PatchType.NavigateParent,
    })
    currentChildIndex = -1
  }

  // Add remove patches in reverse order (highest index first)
  // This ensures indices remain valid as we remove
  for (let j = indicesToRemove.length - 1; j >= 0; j--) {
    patches.push({
      type: PatchType.RemoveChild,
      index: indicesToRemove[j],
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

    // If nodePatches is null, the root node types are incompatible - need to replace
    if (nodePatches === null) {
      const flatNodes = TreeToArray.treeToArray(newNode)
      patches.push({
        type: PatchType.Replace,
        nodes: flatNodes,
      })
      return
    }

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
