import type { Patch } from '../Patch/Patch.ts'
import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import * as ApplyPendingPatches from '../ApplyPendingPatches/ApplyPendingPatches.ts'
import * as GetKeys from '../GetKeys/GetKeys.ts'
import * as GetTotalChildCount from '../GetTotalChildCount/GetTotalChildCount.ts'
import * as PatchType from '../PatchType/PatchType.ts'
import * as VirtualDomElements from '../VirtualDomElements/VirtualDomElements.ts'

export const diff = (
  oldNodes: readonly VirtualDomNode[],
  newNodes: readonly VirtualDomNode[],
): readonly Patch[] => {
  const patches: Patch[] = []
  const pendingPatches: number[] = []
  let i = 0
  let j = 0
  let siblingOffset = 0
  let maxSiblingOffset = 1
  const indexStack: number[] = [0, 1]
  while (i < oldNodes.length && j < newNodes.length) {
    const oldNode = oldNodes[i]
    const newNode = newNodes[j]

    if (siblingOffset > 0) {
      // pendingPatches.push(PatchType.NavigateSibling, siblingOffset)
    }
    if (siblingOffset === maxSiblingOffset) {
      pendingPatches.push(PatchType.NavigateParent, 0)
      maxSiblingOffset = indexStack.pop() as number
      siblingOffset = (indexStack.pop() as number) + 1
    }

    if (oldNode.type !== newNode.type) {
      let skip = 0
      if (
        pendingPatches.length > 0 &&
        pendingPatches.at(-2) === PatchType.NavigateChild
      ) {
        skip = 2
      }
      ApplyPendingPatches.applyPendingPatches(patches, pendingPatches, skip)
      const oldTotal = GetTotalChildCount.getTotalChildCount(oldNodes, i)
      const newTotal = GetTotalChildCount.getTotalChildCount(newNodes, j)

      patches.push({
        type: PatchType.RemoveChild,
        index: siblingOffset,
      })
      patches.push({
        type: PatchType.Add,
        nodes: newNodes.slice(j, j + newTotal),
      })
      siblingOffset++
      i += oldTotal
      j += newTotal
      continue
    }

    if (
      oldNode.type === VirtualDomElements.Text &&
      newNode.type === VirtualDomElements.Text
    ) {
      if (oldNode.text !== newNode.text) {
        if (siblingOffset !== 0) {
          pendingPatches.push(PatchType.NavigateSibling, siblingOffset)
        }
        ApplyPendingPatches.applyPendingPatches(patches, pendingPatches, 0)
        patches.push({
          type: PatchType.SetText,
          value: newNode.text,
        })
      }
      i++
      j++
      siblingOffset++
      continue
    }

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

    if (hasAttributeChanges) {
      ApplyPendingPatches.applyPendingPatches(patches, pendingPatches, 0)

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

    if (oldNode.childCount && newNode.childCount) {
      maxSiblingOffset = oldNode.childCount
      indexStack.push(0, maxSiblingOffset)
      pendingPatches.push(PatchType.NavigateChild, 0)
      i++
      j++
      continue
    }

    if (oldNode.childCount) {
      ApplyPendingPatches.applyPendingPatches(patches, pendingPatches, 0)
      patches.push({
        type: PatchType.RemoveChild,
        index: 0,
      })
      i += GetTotalChildCount.getTotalChildCount(oldNodes, i)
      j++
      continue
    }

    if (newNode.childCount) {
      ApplyPendingPatches.applyPendingPatches(patches, pendingPatches, 0)
      const total = GetTotalChildCount.getTotalChildCount(newNodes, j)
      patches.push({
        type: PatchType.Add,
        nodes: newNodes.slice(j + 1, j + total),
      })
      i++
      j += total
      continue
    }

    i++
    j++
    siblingOffset++
  }

  while (i < oldNodes.length) {
    if (indexStack.length !== 2) {
      patches.push({
        type: PatchType.NavigateParent,
      })
    }
    patches.push({
      type: PatchType.RemoveChild,
      index: siblingOffset,
    })
    i += GetTotalChildCount.getTotalChildCount(oldNodes, i)
    indexStack.pop()
    indexStack.pop()
  }

  while (j < newNodes.length) {
    if (siblingOffset > 0) {
      patches.push({
        type: PatchType.NavigateSibling,
        index: siblingOffset,
      })
      siblingOffset = 0
    }
    const count = GetTotalChildCount.getTotalChildCount(newNodes, j)
    patches.push({
      type: PatchType.Add,
      nodes: newNodes.slice(j, j + count),
    })
    j += count
  }

  return patches
}
