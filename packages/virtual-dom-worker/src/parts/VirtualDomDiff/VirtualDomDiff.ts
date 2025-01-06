import type { Patch } from '../Patch/Patch.ts'
import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import * as PatchType from '../PatchType/PatchType.ts'
import * as VirtualDomElements from '../VirtualDomElements/VirtualDomElements.ts'

export const diff = (
  oldNodes: readonly VirtualDomNode[],
  newNodes: readonly VirtualDomNode[],
): readonly Patch[] => {
  const patches: Patch[] = []

  // Compare nodes at each index
  for (let i = 0; i < Math.max(oldNodes.length, newNodes.length); i++) {
    const oldNode = oldNodes[i]
    const newNode = newNodes[i]

    // Handle node removal
    if (!newNode) {
      patches.push({
        type: PatchType.Replace,
        index: i,
        // @ts-ignore
        node: undefined,
      })
      continue
    }

    // Handle node addition
    if (!oldNode) {
      patches.push({
        type: PatchType.Replace,
        index: i,
        node: newNode,
      })
      continue
    }

    // Different node types - complete replacement
    if (oldNode.type !== newNode.type) {
      patches.push({
        type: PatchType.Replace,
        index: i,
        node: newNode,
      })
      continue
    }

    // Text node changes
    if (
      oldNode.type === VirtualDomElements.Text &&
      newNode.type === VirtualDomElements.Text
    ) {
      if (oldNode.text !== newNode.text) {
        patches.push({
          type: PatchType.SetText,
          index: i,
          value: newNode.text,
        })
      }
      continue
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
          index: i,
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
          index: i,
          key,
        })
      }
    }
  }

  return patches
}
