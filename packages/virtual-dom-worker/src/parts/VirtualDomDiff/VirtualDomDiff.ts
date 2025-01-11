import type { Patch } from '../Patch/Patch.ts'
import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import * as GetTotalChildCount from '../GetTotalChildCount/GetTotalChildCount.ts'
import * as PatchType from '../PatchType/PatchType.ts'
import * as VirtualDomElements from '../VirtualDomElements/VirtualDomElements.ts'

const applyPendingPatches = (
  patches: Patch[],
  pendingPatches: number[],
  skip: number,
): void => {
  for (let k = 0; k < pendingPatches.length - skip; k += 2) {
    const type = pendingPatches[k]
    const index = pendingPatches[k + 1]
    patches.push({
      type,
      index,
    } as Patch)
  }
  pendingPatches.length = 0
}

export const diff = (
  oldNodes: readonly VirtualDomNode[],
  newNodes: readonly VirtualDomNode[],
): readonly Patch[] => {
  const patches: Patch[] = []
  const pendingPatches: number[] = []
  let i = 0
  let j = 0
  let siblingOffset = 0

  while (i < oldNodes.length && j < newNodes.length) {
    const oldNode = oldNodes[i]
    const newNode = newNodes[j]

    if (siblingOffset > 0) {
      patches.push({
        type: PatchType.NavigateSibling,
        index: siblingOffset,
      })
      siblingOffset = 0
    }

    if (oldNode.type !== newNode.type) {
      applyPendingPatches(patches, pendingPatches, 2)
      const oldTotal = GetTotalChildCount.getTotalChildCount(oldNodes, i)
      const newTotal = GetTotalChildCount.getTotalChildCount(newNodes, j)
      patches.push({
        type: PatchType.RemoveChild,
        index: 0,
      })
      patches.push({
        type: PatchType.Add,
        nodes: newNodes.slice(j, j + newTotal),
      })
      i += oldTotal
      j += newTotal
      continue
    }

    if (
      oldNode.type === VirtualDomElements.Text &&
      newNode.type === VirtualDomElements.Text
    ) {
      if (oldNode.text !== newNode.text) {
        applyPendingPatches(patches, pendingPatches, 0)
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

    const oldKeys = Object.keys(oldNode).filter(
      (key) => key !== 'type' && key !== 'childCount',
    )
    const newKeys = Object.keys(newNode).filter(
      (key) => key !== 'type' && key !== 'childCount',
    )

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
      applyPendingPatches(patches, pendingPatches, 0)

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
      pendingPatches.push(PatchType.NavigateChild, 0)
      i++
      j++
      continue
    }

    if (oldNode.childCount) {
      applyPendingPatches(patches, pendingPatches, 0)

      patches.push({
        type: PatchType.RemoveChild,
        index: 0,
      })
      i += GetTotalChildCount.getTotalChildCount(oldNodes, i)
      j++
      continue
    }

    if (newNode.childCount) {
      applyPendingPatches(patches, pendingPatches, 0)
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
    if (siblingOffset > 0) {
      patches.push({
        type: PatchType.NavigateSibling,
        index: siblingOffset,
      })
      siblingOffset = 0
    }
    patches.push({
      type: PatchType.RemoveChild,
      index: 0,
    })
    i += GetTotalChildCount.getTotalChildCount(oldNodes, i)
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
