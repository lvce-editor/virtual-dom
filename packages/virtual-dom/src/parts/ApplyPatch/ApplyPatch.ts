import type { Patch } from '../Patch/Patch.ts'
import * as Instances from '../Instances/Instances.ts'
import * as PatchFunctions from '../PatchFunctions/PatchFunctions.ts'
import * as PatchType from '../PatchType/PatchType.ts'
import { getEventListenerMap } from '../RegisterEventListeners/RegisterEventListeners.ts'
import * as VirtualDomElementProp from '../VirtualDomElementProp/VirtualDomElementProp.ts'

interface ApplyState {
  current: Node
  hasAppliedMutation: boolean
}

const handleNavigateChild = (
  state: ApplyState,
  index: number,
  nextPatchType: number | undefined,
): boolean => {
  const $Children = (state.current as HTMLElement).childNodes
  const $Child = $Children[index]
  if ($Child) {
    state.current = $Child
    return true
  }
  if (
    (nextPatchType === PatchType.Replace ||
      nextPatchType === PatchType.SetReferenceNodeUid) &&
    index === $Children.length
  ) {
    const $Placeholder = document.createComment('virtual-dom-placeholder')
    ;(state.current as HTMLElement).append($Placeholder)
    state.current = $Placeholder
    return true
  }
  console.error('Cannot navigate to child: child not found at index', {
    $Current: state.current,
    index,
    childCount: $Children.length,
  })
  return false
}

const handleNavigateParent = (state: ApplyState): boolean => {
  const $Parent = state.current.parentNode
  if (!$Parent) {
    console.error('Cannot navigate to parent: current node has no parent', {
      $Current: state.current,
    })
    return false
  }
  state.current = $Parent
  return true
}

const handleNavigateSibling = (
  state: ApplyState,
  index: number,
  $Element: Node,
  patchIndex: number,
): boolean => {
  const $Parent = state.current.parentNode
  if (!$Parent) {
    console.error('Cannot navigate to sibling: current node has no parent', {
      patchIndex,
    })
    return false
  }
  let $Sibling = $Parent.childNodes[index]
  if (!$Sibling && !state.hasAppliedMutation && state.current !== $Element) {
    $Sibling = $Element.childNodes[index]
  }
  if (!$Sibling) {
    console.error('Cannot navigate to sibling: sibling not found at index', {
      $Parent,
      index,
      childCount: $Parent.childNodes.length,
    })
    return false
  }
  state.current = $Sibling
  return true
}

const handleSingleNavigation = (
  state: ApplyState,
  type: number,
  index: number,
  nextPatchType: number | undefined,
  $Element: Node,
  patchIndex: number,
): boolean => {
  switch (type) {
    case PatchType.NavigateChild:
      return handleNavigateChild(state, index, nextPatchType)
    case PatchType.NavigateParent:
      return handleNavigateParent(state)
    case PatchType.NavigateSibling:
      return handleNavigateSibling(state, index, $Element, patchIndex)
    default:
      console.error('Unknown navigation type', { type })
      return false
  }
}

const handleMultiNavigation = (
  state: ApplyState,
  navigations: readonly number[],
  nextPatchType: number | undefined,
  $Element: Node,
  patchIndex: number,
): boolean => {
  for (let i = 0; i < navigations.length; i += 2) {
    const type = navigations[i]
    const index = navigations[i + 1]
    const nextType = navigations[i + 2] ?? nextPatchType
    if (
      !handleSingleNavigation(
        state,
        type,
        index,
        nextType,
        $Element,
        patchIndex,
      )
    ) {
      return false
    }
  }
  return true
}

const handleSetReferenceNodeUid = (state: ApplyState, patch: any): boolean => {
  const instance = Instances.get(patch.uid)
  if (!instance || !instance.state) {
    console.error('Cannot set reference node uid: instance not found', {
      uid: patch.uid,
    })
    return false
  }
  const $NewNode = instance.state.$Viewlet
  // @ts-ignore
  state.current.replaceWith($NewNode)
  state.current = $NewNode
  state.hasAppliedMutation = true
  return true
}

const handleNavigationPatch = (
  state: ApplyState,
  patch: Patch,
  patches: readonly Patch[],
  patchIndex: number,
  $Element: Node,
): boolean => {
  switch (patch.type) {
    case PatchType.MultiNavigation:
      return handleMultiNavigation(
        state,
        patch.navigations,
        patches[patchIndex + 1]?.type,
        $Element,
        patchIndex,
      )
    case PatchType.NavigateChild:
      return handleNavigateChild(
        state,
        patch.index,
        patches[patchIndex + 1]?.type,
      )
    case PatchType.NavigateParent:
      return handleNavigateParent(state)
    case PatchType.NavigateSibling:
      return handleNavigateSibling(state, patch.index, $Element, patchIndex)
    default:
      return true
  }
}

const applyMutationPatch = (
  state: ApplyState,
  patch: Patch,
  events: Record<string, any>,
): void => {
  switch (patch.type) {
    case PatchType.Add:
      PatchFunctions.add(state.current as HTMLElement, patch.nodes, events)
      state.hasAppliedMutation = true
      break
    case PatchType.RemoveAttribute:
      VirtualDomElementProp.removeProp(state.current as HTMLElement, patch.key)
      state.hasAppliedMutation = true
      break
    case PatchType.RemoveChild:
      PatchFunctions.removeChild(state.current as HTMLElement, patch.index)
      state.hasAppliedMutation = true
      break
    case PatchType.Replace:
      state.current = PatchFunctions.replace(
        state.current as HTMLElement,
        patch.nodes,
        events,
      )
      state.hasAppliedMutation = true
      break
    case PatchType.SetAttribute:
      VirtualDomElementProp.setProp(
        state.current as HTMLElement,
        patch.key,
        patch.value,
        events,
      )
      state.hasAppliedMutation = true
      break
    case PatchType.SetText:
      PatchFunctions.setText(state.current as Text, patch.value)
      state.hasAppliedMutation = true
      break
    default:
      break
  }
}

export const applyPatch = (
  $Element: Node,
  patches: readonly Patch[],
  eventMap: Record<string, any> = {},
  id: any = 0,
): void => {
  const events = getEventListenerMap(id) || eventMap
  const state: ApplyState = {
    current: $Element,
    hasAppliedMutation: false,
  }
  for (let patchIndex = 0; patchIndex < patches.length; patchIndex++) {
    const patch = patches[patchIndex]
    try {
      if (!handleNavigationPatch(state, patch, patches, patchIndex, $Element)) {
        return
      }
      if (patch.type === PatchType.SetReferenceNodeUid) {
        if (!handleSetReferenceNodeUid(state, patch)) {
          return
        }
        continue
      }
      applyMutationPatch(state, patch, events)
    } catch (error) {
      console.error('Error applying patch at index ' + patchIndex, patch, error)
      throw error
    }
  }
}
