import { VirtualDomElements } from '@lvce-editor/constants'
import type { Patch } from '../Patch/Patch.ts'
import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import * as ApplyPendingPatches from '../ApplyPendingPatches/ApplyPendingPatches.ts'
import * as GetKeys from '../GetKeys/GetKeys.ts'
import * as GetTotalChildCount from '../GetTotalChildCount/GetTotalChildCount.ts'
import * as PatchType from '../PatchType/PatchType.ts'

interface DiffState {
  i: number
  indexStack: number[]
  j: number
  maxSiblingOffset: number
  patches: Patch[]
  pendingPatches: number[]
  siblingOffset: number
}

const applyPendingPatches = (state: DiffState, skip = 0): void => {
  ApplyPendingPatches.applyPendingPatches(
    state.patches,
    state.pendingPatches,
    skip,
  )
}

const syncAncestorNavigation = (state: DiffState): void => {
  while (state.siblingOffset === state.maxSiblingOffset) {
    state.pendingPatches.push(PatchType.NavigateParent, 0)
    state.indexStack.pop()
    state.indexStack.pop()
    state.maxSiblingOffset = state.indexStack.pop() as number
    state.siblingOffset = (state.indexStack.pop() as number) + 1
  }
}

const hasPendingNavigateChild = (
  pendingPatches: readonly number[],
): boolean => {
  return (
    pendingPatches.length > 0 &&
    pendingPatches.at(-2) === PatchType.NavigateChild
  )
}

const replaceMismatchedNode = (
  state: DiffState,
  oldNodes: readonly VirtualDomNode[],
  newNodes: readonly VirtualDomNode[],
): void => {
  const skip = hasPendingNavigateChild(state.pendingPatches) ? 2 : 0
  applyPendingPatches(state, skip)
  const oldTotal = GetTotalChildCount.getTotalChildCount(oldNodes, state.i)
  const newTotal = GetTotalChildCount.getTotalChildCount(newNodes, state.j)

  state.patches.push({
    index: state.siblingOffset,
    type: PatchType.RemoveChild,
  })
  state.patches.push({
    nodes: newNodes.slice(state.j, state.j + newTotal),
    type: PatchType.Add,
  })
  state.siblingOffset++
  state.i += oldTotal
  state.j += newTotal
}

const updateTextNode = (
  state: DiffState,
  oldNode: VirtualDomNode,
  newNode: VirtualDomNode,
): void => {
  if (oldNode.text !== newNode.text) {
    if (state.siblingOffset !== 0) {
      state.pendingPatches.push(PatchType.NavigateSibling, state.siblingOffset)
    }
    applyPendingPatches(state)
    state.patches.push({
      type: PatchType.SetText,
      value: newNode.text,
    })
  }
  state.i++
  state.j++
  state.siblingOffset++
}

const hasAttributeChanges = (
  oldNode: VirtualDomNode,
  newNode: VirtualDomNode,
  oldKeys: readonly string[],
  newKeys: readonly string[],
): boolean => {
  for (const key of newKeys) {
    if (oldNode[key] !== newNode[key]) {
      return true
    }
  }
  for (const key of oldKeys) {
    if (!Object.hasOwn(newNode, key)) {
      return true
    }
  }
  return false
}

const applyAttributeChanges = (
  state: DiffState,
  oldNode: VirtualDomNode,
  newNode: VirtualDomNode,
): void => {
  const oldKeys = GetKeys.getKeys(oldNode)
  const newKeys = GetKeys.getKeys(newNode)
  if (!hasAttributeChanges(oldNode, newNode, oldKeys, newKeys)) {
    return
  }
  if (state.siblingOffset > 0) {
    state.pendingPatches.push(PatchType.NavigateSibling, state.siblingOffset)
  }
  applyPendingPatches(state)

  for (const key of newKeys) {
    if (oldNode[key] !== newNode[key]) {
      state.patches.push({
        key,
        type: PatchType.SetAttribute,
        value: newNode[key],
      })
    }
  }
  for (const key of oldKeys) {
    if (!Object.hasOwn(newNode, key)) {
      state.patches.push({
        key,
        type: PatchType.RemoveAttribute,
      })
    }
  }
}

const enterChildLevel = (state: DiffState, childCount: number): void => {
  state.maxSiblingOffset = childCount
  state.indexStack.push(0, state.maxSiblingOffset)
  state.pendingPatches.push(PatchType.NavigateChild, 0)
  state.i++
  state.j++
}

const removeOldChildren = (
  state: DiffState,
  oldNodes: readonly VirtualDomNode[],
  childCount: number,
): void => {
  applyPendingPatches(state)
  for (let k = 0; k < childCount; k++) {
    state.patches.push({
      index: 0,
      type: PatchType.RemoveChild,
    })
  }
  state.i += GetTotalChildCount.getTotalChildCount(oldNodes, state.i)
  state.j++
  state.siblingOffset++
}

const addNewChildren = (
  state: DiffState,
  newNodes: readonly VirtualDomNode[],
): void => {
  applyPendingPatches(state)
  const total = GetTotalChildCount.getTotalChildCount(newNodes, state.j)
  state.patches.push({
    nodes: newNodes.slice(state.j + 1, state.j + total),
    type: PatchType.Add,
  })
  state.i++
  state.j += total
}

const removeRemainingOldNodes = (
  state: DiffState,
  oldNodes: readonly VirtualDomNode[],
): void => {
  while (state.i < oldNodes.length) {
    if (state.indexStack.length !== 2) {
      state.patches.push({
        type: PatchType.NavigateParent,
      })
    }
    state.patches.push({
      index: state.siblingOffset,
      type: PatchType.RemoveChild,
    })
    state.i += GetTotalChildCount.getTotalChildCount(oldNodes, state.i)
    state.indexStack.pop()
    state.indexStack.pop()
  }
}

const addRemainingNewNodes = (
  state: DiffState,
  newNodes: readonly VirtualDomNode[],
): void => {
  while (state.j < newNodes.length) {
    if (state.siblingOffset > 0) {
      state.patches.push({
        index: state.siblingOffset,
        type: PatchType.NavigateSibling,
      })
      state.siblingOffset = 0
    }
    const count = GetTotalChildCount.getTotalChildCount(newNodes, state.j)
    state.patches.push({
      nodes: newNodes.slice(state.j, state.j + count),
      type: PatchType.Add,
    })
    state.j += count
  }
}

export const diff = (
  oldNodes: readonly VirtualDomNode[],
  newNodes: readonly VirtualDomNode[],
): readonly Patch[] => {
  const state: DiffState = {
    i: 0,
    j: 0,
    siblingOffset: 0,
    maxSiblingOffset: 1,
    patches: [],
    pendingPatches: [],
    indexStack: [0, 1],
  }

  while (state.i < oldNodes.length && state.j < newNodes.length) {
    const oldNode = oldNodes[state.i]
    const newNode = newNodes[state.j]

    syncAncestorNavigation(state)

    if (oldNode.type !== newNode.type) {
      replaceMismatchedNode(state, oldNodes, newNodes)
      continue
    }

    if (
      oldNode.type === VirtualDomElements.Text &&
      newNode.type === VirtualDomElements.Text
    ) {
      updateTextNode(state, oldNode, newNode)
      continue
    }

    applyAttributeChanges(state, oldNode, newNode)

    if (oldNode.childCount && newNode.childCount) {
      enterChildLevel(state, oldNode.childCount)
      continue
    }

    if (oldNode.childCount) {
      removeOldChildren(state, oldNodes, oldNode.childCount)
      continue
    }

    if (newNode.childCount) {
      addNewChildren(state, newNodes)
      continue
    }

    state.i++
    state.j++
    state.siblingOffset++
  }

  removeRemainingOldNodes(state, oldNodes)
  addRemainingNewNodes(state, newNodes)

  return state.patches
}
