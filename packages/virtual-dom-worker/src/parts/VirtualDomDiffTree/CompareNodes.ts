import { VirtualDomElements } from '@lvce-editor/constants'
import type { Patch } from '../Patch/Patch.ts'
import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import * as GetKeys from '../GetKeys/GetKeys.ts'
import * as PatchType from '../PatchType/PatchType.ts'

export const compareNodes = (
  oldNode: VirtualDomNode,
  newNode: VirtualDomNode,
): Patch[] | null => {
  const patches: Patch[] = []

  // Check if node type changed - return null to signal incompatible nodes
  // (caller should handle this with a Replace operation)
  if (oldNode.type !== newNode.type) {
    return null
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
