import type { Patch } from '../Patch/Patch.ts'
import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import * as PatchType from '../PatchType/PatchType.ts'
import * as VirtualDomElements from '../VirtualDomElements/VirtualDomElements.ts'

export const diff = (
  oldNode: VirtualDomNode,
  newNode: VirtualDomNode,
): Patch[] => {
  const patches: Patch[] = []

  // Different node types - complete replacement
  if (oldNode.type !== newNode.type) {
    patches.push({
      type: PatchType.Replace,
      index: 0,
      node: newNode,
    })
    return patches
  }

  // Text node changes
  if (
    oldNode.type === VirtualDomElements.Text &&
    newNode.type === VirtualDomElements.Text
  ) {
    // VirtualDomElements.Text
    if (oldNode.text !== newNode.text) {
      patches.push({
        type: PatchType.SetText,
        index: 0,
        value: newNode.text,
      })
    }
    return patches
  }

  // Attribute changes
  for (const key in newNode) {
    if (key === 'type' || key === 'childCount') continue
    if (oldNode[key] !== newNode[key]) {
      patches.push({
        type: PatchType.SetAttribute,
        index: 0,
        key,
        value: newNode[key],
      })
    }
  }

  return patches
}
