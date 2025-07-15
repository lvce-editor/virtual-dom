import { createTree } from '../CreateTree/CreateTree.ts'
import type { Patch } from '../Patch/Patch.ts'
import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import type { Patch } from '../Patch/Patch.ts'
import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import * as ApplyPendingPatches from '../ApplyPendingPatches/ApplyPendingPatches.ts'
import * as GetKeys from '../GetKeys/GetKeys.ts'
import * as GetTotalChildCount from '../GetTotalChildCount/GetTotalChildCount.ts'
import * as PatchType from '../PatchType/PatchType.ts'
import * as VirtualDomElements from '../VirtualDomElements/VirtualDomElements.ts'

const diffTree = (a: any, b: any, patches: Patch[]): void => {
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
    return
  }

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
