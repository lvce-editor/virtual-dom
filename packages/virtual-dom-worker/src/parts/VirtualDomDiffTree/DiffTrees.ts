import type { Patch } from '../Patch/Patch.ts'
import type * as VirtualDomTree from '../VirtualDomTree/VirtualDomTree.ts'
import * as AppendNavigationPatch from '../AppendNavigationPatch/AppendNavigationPatch.ts'
import * as PatchType from '../PatchType/PatchType.ts'
import * as CompareNodes from './CompareNodes.ts'
import * as TreeToArray from './TreeToArray.ts'

const navigateToChild = (
  patches: Patch[],
  currentChildIndex: number,
  index: number,
): number => {
  if (currentChildIndex === -1) {
    AppendNavigationPatch.appendNavigationPatch(
      patches,
      PatchType.NavigateChild,
      index,
    )
    return index
  }
  if (currentChildIndex !== index) {
    AppendNavigationPatch.appendNavigationPatch(
      patches,
      PatchType.NavigateSibling,
      index,
    )
  }
  return index
}

const navigateToParent = (
  patches: Patch[],
  currentChildIndex: number,
): number => {
  if (currentChildIndex >= 0) {
    AppendNavigationPatch.appendNavigationPatch(
      patches,
      PatchType.NavigateParent,
      0,
    )
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

const appendPatch = (patches: Patch[], patch: Patch): void => {
  switch (patch.type) {
    case PatchType.MultiNavigation:
      for (let i = 0; i < patch.navigations.length; i += 2) {
        AppendNavigationPatch.appendNavigationPatch(
          patches,
          patch.navigations[i],
          patch.navigations[i + 1],
        )
      }
      return
    case PatchType.NavigateChild:
    case PatchType.NavigateSibling:
      AppendNavigationPatch.appendNavigationPatch(
        patches,
        patch.type,
        patch.index,
      )
      return
    case PatchType.NavigateParent:
      AppendNavigationPatch.appendNavigationPatch(patches, patch.type, 0)
      return
    default:
      patches.push(patch)
  }
}

const appendPatches = (
  patches: Patch[],
  newPatches: readonly Patch[],
): void => {
  for (const patch of newPatches) {
    appendPatch(patches, patch)
  }
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
  const childPatches: Patch[] = []
  if (hasChildrenToCompare) {
    diffChildren(oldNode.children, newNode.children, childPatches)
  }
  if (nodePatches.length === 0 && childPatches.length === 0) {
    return currentChildIndex
  }

  const nextChildIndex = navigateToChild(patches, currentChildIndex, index)
  patches.push(...nodePatches)
  appendPatches(patches, childPatches)
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
