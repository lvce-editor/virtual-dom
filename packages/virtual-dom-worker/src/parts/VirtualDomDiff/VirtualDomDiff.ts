import type { Patch } from '../Patch/Patch.ts'
import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import * as PatchType from '../PatchType/PatchType.ts'
import * as VirtualDomElements from '../VirtualDomElements/VirtualDomElements.ts'

export const diff = (
  oldNode: VirtualDomNode,
  newNode: VirtualDomNode,
  baseIndex = 0,
): readonly Patch[] => {
  const patches: Patch[] = []

  // Different node types - complete replacement
  if (oldNode.type !== newNode.type) {
    patches.push({
      type: PatchType.Replace,
      index: baseIndex,
      node: newNode,
    })
    return patches
  }

  // Text node changes
  if (
    oldNode.type === VirtualDomElements.Text &&
    newNode.type === VirtualDomElements.Text
  ) {
    if (oldNode.text !== newNode.text) {
      patches.push({
        type: PatchType.SetText,
        index: baseIndex,
        value: newNode.text,
      })
    }
    return patches
  }

  // Attribute changes
  const oldKeys = Object.keys(oldNode).filter(
    (key) => key !== 'type' && key !== 'childCount',
  )
  const newKeys = Object.keys(newNode).filter(
    (key) => key !== 'type' && key !== 'childCount',
  )

  // Check for changed or added attributes
  for (const key of newKeys) {
    if (oldNode[key] !== newNode[key]) {
      patches.push({
        type: PatchType.SetAttribute,
        index: baseIndex,
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
        index: baseIndex,
        key,
      })
    }
  }

  // Handle children
  if (oldNode.childCount > 0 || newNode.childCount > 0) {
    let oldChildIndex = baseIndex + 1
    let newChildIndex = baseIndex + 1

    for (let i = 0; i < Math.max(oldNode.childCount, newNode.childCount); i++) {
      if (i < oldNode.childCount && i < newNode.childCount) {
        // Both nodes have this child - diff them
        const childPatches = diff(
          oldNode.children[i],
          newNode.children[i],
          oldChildIndex,
        )
        patches.push(...childPatches)
      } else if (i < newNode.childCount) {
        // New child added
        patches.push({
          type: PatchType.Replace,
          index: newChildIndex,
          node: newNode.children[i],
        })
      }
      // Skip removed children as they will be handled by the parent's replacement

      // Update indices based on child counts
      if (i < oldNode.childCount) {
        oldChildIndex += getNodeSize(oldNode.children[i])
      }
      if (i < newNode.childCount) {
        newChildIndex += getNodeSize(newNode.children[i])
      }
    }
  }

  return patches
}

const getNodeSize = (node: VirtualDomNode): number => {
  return 1 + (node.childCount || 0)
}
