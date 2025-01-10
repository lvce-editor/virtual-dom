import type { Patch } from '../Patch/Patch.ts'
import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import * as GetTotalChildCount from '../GetTotalChildCount/GetTotalChildCount.ts'
import * as PatchType from '../PatchType/PatchType.ts'
import * as VirtualDomElements from '../VirtualDomElements/VirtualDomElements.ts'

export const diff = (
  oldNodes: readonly VirtualDomNode[],
  newNodes: readonly VirtualDomNode[],
): readonly Patch[] => {
  const patches: Patch[] = []

  let i = 0 // Index for oldNodes
  let j = 0 // Index for newNodes

  const oldNodeCount = oldNodes.length
  const newNodeCount = newNodes.length

  while (i < oldNodeCount && j < newNodeCount) {
    const oldNode = oldNodes[i]
    const newNode = newNodes[j]

    if (oldNode.type !== newNode.type) {
      const oldTotal = GetTotalChildCount.getTotalChildCount(oldNodes, i)
      const newTotal = GetTotalChildCount.getTotalChildCount(newNodes, j)
      patches.push({
        type: PatchType.Remove,
        index: i,
      })
      patches.push({
        type: PatchType.Add,
        index: i,
        nodes: newNodes.slice(j, j + newTotal),
      })
      i += oldTotal
      j += newTotal
      continue
    }

    // text node
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
      i++
      j++
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

    i++
    j++
  }

  while (i < oldNodes.length) {
    const count = GetTotalChildCount.getTotalChildCount(oldNodes, i)
    patches.push({
      type: PatchType.Remove,
      index: i,
    })
    i += count
  }
  while (j < newNodes.length) {
    const count = GetTotalChildCount.getTotalChildCount(newNodes, j)
    // TODO find right index to add
    patches.push({
      type: PatchType.Add,
      index: i,
      nodes: newNodes.slice(j, j + count),
    })
    j += count
  }
  return patches
}
