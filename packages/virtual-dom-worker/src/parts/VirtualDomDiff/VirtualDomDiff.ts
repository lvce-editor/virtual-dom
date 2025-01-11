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
  let siblingOffset = 0
  let depth = 0

  const oldNodeCount = oldNodes.length
  const newNodeCount = newNodes.length

  while (i < oldNodeCount && j < newNodeCount) {
    const oldNode = oldNodes[i]
    const newNode = newNodes[j]

    if (oldNode.type !== newNode.type) {
      if (depth > 0) {
        patches.push({
          type: PatchType.NavigateParent,
        })
        depth--
      }
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

    if (siblingOffset > 0) {
      patches.push({
        type: PatchType.NavigateSibling,
        index: siblingOffset,
      })
      siblingOffset = 0
    }

    // text node
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
      i++
      j++
      siblingOffset++
      continue
    }

    // Attribute changes
    const oldKeys = Object.keys(oldNode).filter(
      (key) => key !== 'type' && key !== 'childCount',
    )
    const newKeys = Object.keys(newNode).filter(
      (key) => key !== 'type' && key !== 'childCount',
    )

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

    if (oldNode.childCount && newNode.childCount) {
      patches.push({
        type: PatchType.NavigateChild,
        index: 0,
      })
      depth++
      i++
      j++
      continue
    }

    if (oldNode.childCount) {
      if (depth > 0) {
        patches.push({
          type: PatchType.NavigateParent,
        })
        depth--
      }
      patches.push({
        type: PatchType.RemoveChild,
        index: 0,
      })
      i += GetTotalChildCount.getTotalChildCount(oldNodes, i)
      j++
      continue
    }

    if (newNode.childCount) {
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

  // Handle remaining old nodes
  while (i < oldNodes.length) {
    if (siblingOffset > 0) {
      patches.push({
        type: PatchType.NavigateSibling,
        index: siblingOffset,
      })
      siblingOffset = 0
    }
    if (depth > 0) {
      patches.push({
        type: PatchType.NavigateParent,
      })
      depth--
    }
    patches.push({
      type: PatchType.RemoveChild,
      index: 0,
    })
    i += GetTotalChildCount.getTotalChildCount(oldNodes, i)
  }

  // Handle remaining new nodes
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
