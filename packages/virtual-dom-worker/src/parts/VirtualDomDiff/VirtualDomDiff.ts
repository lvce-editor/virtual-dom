import type { Patch } from '../Patch/Patch.ts'
import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'

export const diff = (
  oldNode: VirtualDomNode,
  newNode: VirtualDomNode,
): Patch[] => {
  const patches: Patch[] = []

  // Different node types - complete replacement
  if (oldNode.type !== newNode.type) {
    patches.push({
      type: 'replace',
      index: 0,
      node: newNode,
    })
    return patches
  }

  // Text node changes
  if (oldNode.type === 12 && newNode.type === 12) {
    // VirtualDomElements.Text
    if (oldNode.text !== newNode.text) {
      patches.push({
        type: 'setText',
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
        type: 'setAttribute',
        index: 0,
        key,
        value: newNode[key],
      })
    }
  }

  return patches
}
