import { createTree } from '../CreateTree/CreateTree.ts'
import * as GetKeys from '../GetKeys/GetKeys.ts'
import type { Patch } from '../Patch/Patch.ts'
import * as PatchType from '../PatchType/PatchType.ts'
import * as VirtualDomElements from '../VirtualDomElements/VirtualDomElements.ts'
import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'

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

  const aChildren = a.children
  const bChildren = b.children

  console.log({ aChildren, bChildren })

  if (aChildren.length > bChildren.length) {
    // children removed
  } else if (aChildren.length < bChildren.length) {
    // children added
  } else {
    const length = aChildren.length
    for (let i = 0; i < length; i++) {
      const childA = aChildren[i]
      const childB = bChildren[i]
      if (childA.type === childB.type) {
        diffTree(childA, childB, patches)
      } else {
        patches.push({
          type: PatchType.RemoveChild,
          index: i,
        })
        patches.push({
          type: PatchType.Add,
          nodes: childB,
        })
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
  console.log(JSON.stringify(a, null, 2))
  console.log(JSON.stringify(b, null, 2))
  const patches: Patch[] = []
  diffTree(a, b, patches)
  return patches
}
