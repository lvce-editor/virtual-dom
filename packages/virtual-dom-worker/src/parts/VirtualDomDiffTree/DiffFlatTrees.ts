import type { Patch } from '../Patch/Patch.ts'
import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import * as PatchType from '../PatchType/PatchType.ts'
import { compareNodes } from './CompareNodes.ts'
import {
  appendPatches,
  navigateToChild,
  navigateToParent,
} from './DiffTrees.ts'

const subtreeEnd = (
  nodes: readonly VirtualDomNode[],
  index: number,
): number => {
  let remaining = 1
  while (remaining > 0 && index < nodes.length) {
    remaining += Math.max(0, Math.ceil(nodes[index].childCount || 0)) - 1
    index++
  }
  return index
}

const rootCount = (nodes: readonly VirtualDomNode[]): number => {
  let count = 0
  for (let index = 0; index < nodes.length; index = subtreeEnd(nodes, index)) {
    count++
  }
  return count
}

class FlatTreeDiff {
  private oldIndex = 0
  private newIndex = 0

  constructor(
    private readonly oldNodes: readonly VirtualDomNode[],
    private readonly newNodes: readonly VirtualDomNode[],
  ) {}

  private takeNewSubtree(): readonly VirtualDomNode[] {
    const start = this.newIndex
    this.newIndex = subtreeEnd(this.newNodes, start)
    return this.newNodes.slice(start, this.newIndex)
  }

  private diffExistingChild(
    patches: Patch[],
    currentChildIndex: number,
    index: number,
  ): number {
    const oldNode = this.oldNodes[this.oldIndex]
    const newNode = this.newNodes[this.newIndex]
    const nodePatches = compareNodes(oldNode, newNode)
    if (nodePatches === null) {
      const nextChildIndex = navigateToChild(patches, currentChildIndex, index)
      this.oldIndex = subtreeEnd(this.oldNodes, this.oldIndex)
      patches.push({ type: PatchType.Replace, nodes: this.takeNewSubtree() })
      return nextChildIndex
    }

    this.oldIndex++
    this.newIndex++
    const childPatches: Patch[] = []
    if (oldNode.childCount > 0 || newNode.childCount > 0) {
      this.diffChildren(
        oldNode.childCount || 0,
        newNode.childCount || 0,
        childPatches,
      )
    }
    if (nodePatches.length === 0 && childPatches.length === 0) {
      return currentChildIndex
    }
    const nextChildIndex = navigateToChild(patches, currentChildIndex, index)
    patches.push(...nodePatches)
    appendPatches(patches, childPatches)
    return nextChildIndex
  }

  private diffChildren(
    oldCount: number,
    newCount: number,
    patches: Patch[],
  ): void {
    let currentChildIndex = -1
    const removals: number[] = []
    for (let index = 0; index < Math.max(oldCount, newCount); index++) {
      const oldNode =
        index < oldCount ? this.oldNodes[this.oldIndex] : undefined
      const newNode =
        index < newCount ? this.newNodes[this.newIndex] : undefined
      if (!oldNode && !newNode) {
        break
      }
      if (!oldNode) {
        currentChildIndex = navigateToParent(patches, currentChildIndex)
        patches.push({ type: PatchType.Add, nodes: this.takeNewSubtree() })
      } else if (newNode) {
        currentChildIndex = this.diffExistingChild(
          patches,
          currentChildIndex,
          index,
        )
      } else {
        removals.push(index)
        this.oldIndex = subtreeEnd(this.oldNodes, this.oldIndex)
      }
    }
    navigateToParent(patches, currentChildIndex)
    for (let index = removals.length - 1; index >= 0; index--) {
      patches.push({ type: PatchType.RemoveChild, index: removals[index] })
    }
  }

  private diffRoot(patches: Patch[]): void {
    const oldNode = this.oldNodes[0]
    const newNode = this.newNodes[0]
    const nodePatches = compareNodes(oldNode, newNode)
    if (nodePatches === null) {
      patches.push({ type: PatchType.Replace, nodes: this.takeNewSubtree() })
      return
    }
    this.oldIndex++
    this.newIndex++
    patches.push(...nodePatches)
    this.diffChildren(oldNode.childCount || 0, newNode.childCount || 0, patches)
  }

  diff(patches: Patch[]): void {
    const oldRoots = rootCount(this.oldNodes)
    const newRoots = rootCount(this.newNodes)
    if (oldRoots === 1 && newRoots === 1) {
      this.diffRoot(patches)
    } else {
      this.diffChildren(oldRoots, newRoots, patches)
    }
  }
}

export const diffFlatTrees = (
  oldNodes: readonly VirtualDomNode[],
  newNodes: readonly VirtualDomNode[],
  patches: Patch[],
): void => {
  new FlatTreeDiff(oldNodes, newNodes).diff(patches)
}
