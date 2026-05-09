import type { Patch } from '../Patch/Patch.ts'
import type * as VirtualDomTree from '../VirtualDomTree/VirtualDomTree.ts'
import * as PatchType from '../PatchType/PatchType.ts'
import * as CompareNodes from './CompareNodes.ts'
import * as TreeToArray from './TreeToArray.ts'

const navigateToChild = (
  patches: Patch[],
  currentChildIndex: number,
  index: number,
): number => {
  if (currentChildIndex === -1) {
    patches.push({
      type: PatchType.NavigateChild,
      index,
    })
    return index
  }
  if (currentChildIndex !== index) {
    patches.push({
      type: PatchType.NavigateSibling,
      index,
    })
  }
  return index
}

const navigateToParent = (
  patches: Patch[],
  currentChildIndex: number,
): number => {
  if (currentChildIndex >= 0) {
    patches.push({
      type: PatchType.NavigateParent,
    })
  }
  return -1
}

const addTree = (
  newNode: VirtualDomTree.VirtualDomTreeNode,
  patches: Patch[],
): void => {
  patches.push({
    type: PatchType.Add,
    nodes: TreeToArray.treeToArray(newNode),
  })
}

const replaceTree = (
  newNode: VirtualDomTree.VirtualDomTreeNode,
  patches: Patch[],
): void => {
  patches.push({
    type: PatchType.Replace,
    nodes: TreeToArray.treeToArray(newNode),
  })
}

const diffExistingChild = (
  oldNode: VirtualDomTree.VirtualDomTreeNode,
  newNode: VirtualDomTree.VirtualDomTreeNode,
  patches: Patch[],
  currentChildIndex: number,
  index: number,
): number => {
  const nodePatches = CompareNodes.compareNodes(oldNode.node, newNode.node)
  if (nodePatches === null) {
    const nextChildIndex = navigateToChild(patches, currentChildIndex, index)
    replaceTree(newNode, patches)
    return nextChildIndex
  }

  const hasChildrenToCompare =
    oldNode.children.length > 0 || newNode.children.length > 0
  if (nodePatches.length === 0 && !hasChildrenToCompare) {
    return currentChildIndex
  }

  const nextChildIndex = navigateToChild(patches, currentChildIndex, index)
  if (nodePatches.length > 0) {
    patches.push(...nodePatches)
  }
  if (hasChildrenToCompare) {
    diffChildren(oldNode.children, newNode.children, patches)
  }
  return nextChildIndex
}

const diffRootNode = (
  oldNode: VirtualDomTree.VirtualDomTreeNode,
  newNode: VirtualDomTree.VirtualDomTreeNode,
  patches: Patch[],
): void => {
  const nodePatches = CompareNodes.compareNodes(oldNode.node, newNode.node)
  if (nodePatches === null) {
    replaceTree(newNode, patches)
    return
  }
  if (nodePatches.length > 0) {
    patches.push(...nodePatches)
  }
  if (oldNode.children.length > 0 || newNode.children.length > 0) {
    diffChildren(oldNode.children, newNode.children, patches)
  }
}

const diffChildren = (
  oldChildren: readonly VirtualDomTree.VirtualDomTreeNode[],
  newChildren: readonly VirtualDomTree.VirtualDomTreeNode[],
  patches: Patch[],
): void => {
  const maxLength = Math.max(oldChildren.length, newChildren.length)
  let currentChildIndex = -1
  const indicesToRemove: number[] = []

  for (let i = 0; i < maxLength; i++) {
    const oldNode = oldChildren[i]
    const newNode = newChildren[i]

    if (!oldNode && !newNode) {
      continue
    }

    if (!oldNode) {
      currentChildIndex = navigateToParent(patches, currentChildIndex)
      addTree(newNode, patches)
      continue
    }

    if (!newNode) {
      indicesToRemove.push(i)
      continue
    }

    currentChildIndex = diffExistingChild(
      oldNode,
      newNode,
      patches,
      currentChildIndex,
      i,
    )
  }

  navigateToParent(patches, currentChildIndex)

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
  if (path.length === 0 && oldTree.length === 1 && newTree.length === 1) {
    diffRootNode(oldTree[0], newTree[0], patches)
    return
  }
  diffChildren(oldTree, newTree, patches)
}
