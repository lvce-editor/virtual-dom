import { createTree } from '../CreateTree/CreateTree.ts'
import type { Patch } from '../Patch/Patch.ts'
import * as PatchType from '../PatchType/PatchType.ts'
import * as VirtualDomElements from '../VirtualDomElements/VirtualDomElements.ts'
import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import type { Patch } from '../Patch/Patch.ts'
import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import * as ApplyPendingPatches from '../ApplyPendingPatches/ApplyPendingPatches.ts'
import * as GetKeys from '../GetKeys/GetKeys.ts'
import * as GetTotalChildCount from '../GetTotalChildCount/GetTotalChildCount.ts'
import * as PatchType from '../PatchType/PatchType.ts'
import * as VirtualDomElements from '../VirtualDomElements/VirtualDomElements.ts'

const diffText = (a: any, b: any, patches: Patch[]): boolean => {
  if (
    a.type === VirtualDomElements.Text &&
    b.type === VirtualDomElements.Text
  ) {
    if (a.text !== b.text) {
      patches.push({
        type: PatchType.SetText,
        value: b.text,
      })
    }
    return true
  }
  return false
}

const checkAttributeChanges = (
  oldNode: any,
  newNode: any,
  patches: Patch[],
): void => {
  const oldKeys = GetKeys.getKeys(oldNode)
  const newKeys = GetKeys.getKeys(newNode)
  let hasAttributeChanges = false
  for (const key of newKeys) {
    if (oldNode[key] !== newNode[key]) {
      hasAttributeChanges = true
      break
    }
  }
  for (const key of oldKeys) {
    if (!(key in newNode)) {
      hasAttributeChanges = true
      break
    }
  }
  if (!hasAttributeChanges) {
    return
  }
  for (const key of newKeys) {
    if (oldNode[key] !== newNode[key]) {
      patches.push({
        type: PatchType.SetAttribute,
        key,
        value: newNode[key],
      })
    }
  }
  for (const key of oldKeys) {
    if (!(key in newNode)) {
      patches.push({
        type: PatchType.RemoveAttribute,
        key,
      })
    }
  }
}

const diffTree = (a: any, b: any, patches: Patch[]): void => {
  const hasText = diffText(a, b, patches)
  if (hasText) {
    return
  }

  checkAttributeChanges(a, b, patches)

  if (a.children.length > b.children.length) {
    // children removed
  } else if (a.children.length < b.children.length) {
    // children added
  } else {
    const length = a.children.length
    for (let i = 0; i < length; i++) {
      const childA = a.children[i]
      const childB = b.children[i]
      if (a.type === b.type) {
        diffTree(childA, childB, patches)
      } else {
        // remove node and replace it
      }
    }
  }
}

export const diff2 = (
  oldNodes: readonly VirtualDomNode[],
  newNodes: readonly VirtualDomNode[],
): readonly Patch[] => {
  const a = createTree(oldNodes)
  const b = createTree(newNodes)
  const patches: Patch[] = []
  diffTree(a, b, patches)
  return patches
}
