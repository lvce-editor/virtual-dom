import { VirtualDomElements } from '@lvce-editor/constants'
import type { Patch } from '../Patch/Patch.ts'
import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import * as GetKeys from '../GetKeys/GetKeys.ts'
import * as PatchType from '../PatchType/PatchType.ts'
import * as VirtualDomTree from '../VirtualDomTree/VirtualDomTree.ts'

export const diffTree = (
  oldNodes: readonly VirtualDomNode[],
  newNodes: readonly VirtualDomNode[],
): readonly Patch[] => {
  // Step 1: Convert flat arrays to tree structures
  const oldTree = VirtualDomTree.arrayToTree(oldNodes)
  const newTree = VirtualDomTree.arrayToTree(newNodes)
  
  // Step 2: Compare the trees
  const patches: Patch[] = []
  diffTrees(oldTree, newTree, patches, [])
  
  // Remove trailing navigation patches since they serve no purpose
  return removeTrailingNavigationPatches(patches)
}

const diffTrees = (
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
      addNavigationPatches(patches, path, i)
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
    } else if (!newNode) {
      // Remove old node
      addNavigationPatches(patches, path, i)
      patches.push({
        type: PatchType.RemoveChild,
        index: i,
      })
    } else {
      // Compare nodes
      const nodePatches = compareNodes(oldNode.node, newNode.node)
      if (nodePatches.length > 0) {
        addNavigationPatches(patches, path, i)
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
    }
  }
}

const compareNodes = (
  oldNode: VirtualDomNode,
  newNode: VirtualDomNode,
): Patch[] => {
  const patches: Patch[] = []
  
  // Check if node type changed
  if (oldNode.type !== newNode.type) {
    patches.push({
      type: PatchType.RemoveChild,
      index: 0,
    })
    patches.push({
      type: PatchType.Add,
      nodes: [newNode],
    })
    return patches
  }
  
  // Handle text nodes
  if (
    oldNode.type === VirtualDomElements.Text &&
    newNode.type === VirtualDomElements.Text
  ) {
    if (oldNode.text !== newNode.text) {
      patches.push({
        type: PatchType.SetText,
        value: newNode.text,
      })
    }
    return patches
  }
  
  // Compare attributes
  const oldKeys = GetKeys.getKeys(oldNode)
  const newKeys = GetKeys.getKeys(newNode)
  
  // Check for attribute changes
  for (const key of newKeys) {
    if (oldNode[key] !== newNode[key]) {
      patches.push({
        type: PatchType.SetAttribute,
        key,
        value: newNode[key],
      })
    }
  }
  
  // Check for removed attributes
  for (const key of oldKeys) {
    if (!(key in newNode)) {
      patches.push({
        type: PatchType.RemoveAttribute,
        key,
      })
    }
  }
  
  return patches
}

const addNavigationPatches = (
  patches: Patch[],
  path: number[],
  currentIndex: number,
): void => {
  // Only add navigation if we're not at the root
  if (path.length === 0 && currentIndex === 0) {
    return
  }
  
  // Navigate to the correct position
  for (let i = 0; i < path.length; i++) {
    patches.push({
      type: PatchType.NavigateChild,
      index: path[i],
    })
  }
  
  // Navigate to sibling if needed
  if (currentIndex > 0) {
    patches.push({
      type: PatchType.NavigateSibling,
      index: currentIndex,
    })
  }
}

const removeTrailingNavigationPatches = (patches: Patch[]): Patch[] => {
  // Find the last non-navigation patch
  let lastNonNavigationIndex = -1
  for (let i = patches.length - 1; i >= 0; i--) {
    const patch = patches[i]
    if (
      patch.type !== PatchType.NavigateChild &&
      patch.type !== PatchType.NavigateParent &&
      patch.type !== PatchType.NavigateSibling
    ) {
      lastNonNavigationIndex = i
      break
    }
  }
  
  // Return patches up to and including the last non-navigation patch
  return lastNonNavigationIndex === -1 ? [] : patches.slice(0, lastNonNavigationIndex + 1)
}