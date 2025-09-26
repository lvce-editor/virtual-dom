import { VirtualDomElements } from '@lvce-editor/constants'
import type { Patch } from '../Patch/Patch.ts'
import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import * as GetKeys from '../GetKeys/GetKeys.ts'
import * as PatchType from '../PatchType/PatchType.ts'

export const diffTree = (
  oldNodes: readonly VirtualDomNode[],
  newNodes: readonly VirtualDomNode[],
): readonly Patch[] => {
  const patches: Patch[] = []

  diffNodes(oldNodes, newNodes, patches, [])

  // Remove trailing navigation patches since they serve no purpose
  return removeTrailingNavigationPatches(patches)
}

const diffNodes = (
  oldNodes: readonly VirtualDomNode[],
  newNodes: readonly VirtualDomNode[],
  patches: Patch[],
  path: number[],
): void => {
  const maxLength = Math.max(oldNodes.length, newNodes.length)

  for (let i = 0; i < maxLength; i++) {
    const oldNode = oldNodes[i]
    const newNode = newNodes[i]

    if (!oldNode && !newNode) {
      continue
    }

    if (!oldNode) {
      // Add new node
      addNavigationPatches(patches, path, i)
      patches.push({
        type: PatchType.Add,
        nodes: [newNode],
      })
    } else if (!newNode) {
      // Remove old node
      addNavigationPatches(patches, path, i)
      patches.push({
        type: PatchType.RemoveChild,
        index: i,
      })
    } else {
      // Compare nodes
      const nodePatches = compareNodes(oldNode, newNode)
      if (nodePatches.length > 0) {
        addNavigationPatches(patches, path, i)
        patches.push(...nodePatches)
      }

      // Compare children if both nodes have them
      if (oldNode.childCount > 0 || newNode.childCount > 0) {
        const oldChildren = getChildren(oldNodes, i)
        const newChildren = getChildren(newNodes, i)

        if (oldChildren.length > 0 || newChildren.length > 0) {
          patches.push({
            type: PatchType.NavigateChild,
            index: 0,
          })
          diffNodes(oldChildren, newChildren, patches, [...path, 0])
          patches.push({
            type: PatchType.NavigateParent,
          })
        }
      }
    }
  }
}

const getChildren = (nodes: readonly VirtualDomNode[], startIndex: number): VirtualDomNode[] => {
  const parent = nodes[startIndex]
  if (!parent || !parent.childCount) {
    return []
  }

  const children: VirtualDomNode[] = []
  let i = startIndex + 1
  let remaining = parent.childCount

  while (remaining > 0 && i < nodes.length) {
    const node = nodes[i]
    children.push(node)

    // Skip the node and its children
    i += 1 + (node.childCount || 0)
    remaining--
  }

  return children
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