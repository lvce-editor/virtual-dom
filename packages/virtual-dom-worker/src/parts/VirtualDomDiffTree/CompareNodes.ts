import { VirtualDomElements } from '@lvce-editor/constants'
import type { Patch } from '../Patch/Patch.ts'
import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import * as IsKey from '../IsKey/IsKey.ts'
import * as PatchType from '../PatchType/PatchType.ts'

const isAttribute = (node: VirtualDomNode, key: string): boolean => {
  return (
    Object.hasOwn(node, key) &&
    IsKey.isKey(key) &&
    (node.type !== VirtualDomElements.Reference || key !== 'uid')
  )
}

const compareAttributes = (
  oldNode: VirtualDomNode,
  newNode: VirtualDomNode,
  referenceChanged: boolean,
  patches: Patch[],
): void => {
  // Check for attribute changes
  for (const key in newNode) {
    if (!isAttribute(newNode, key)) {
      continue
    }
    if (referenceChanged || oldNode[key] !== newNode[key]) {
      patches.push({
        type: PatchType.SetAttribute,
        key,
        value: newNode[key],
      })
    }
  }

  // Check for removed attributes
  for (const key in oldNode) {
    if (!isAttribute(oldNode, key)) {
      continue
    }
    if (!Object.hasOwn(newNode, key)) {
      patches.push({
        type: PatchType.RemoveAttribute,
        key,
      })
    }
  }
}

export const compareNodes = (
  oldNode: VirtualDomNode,
  newNode: VirtualDomNode,
): Patch[] | null => {
  // Check if node type changed - return null to signal incompatible nodes
  // (caller should handle this with a Replace operation)
  if (oldNode.type !== newNode.type) {
    return null
  }

  const patches: Patch[] = []

  // A different reference owns a different DOM element, so its props must
  // be applied even when they match the previous reference's props.
  const referenceChanged =
    oldNode.type === VirtualDomElements.Reference && oldNode.uid !== newNode.uid
  if (referenceChanged) {
    patches.push({
      type: PatchType.SetReferenceNodeUid,
      uid: newNode.uid,
    })
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

  compareAttributes(oldNode, newNode, referenceChanged, patches)

  return patches
}
