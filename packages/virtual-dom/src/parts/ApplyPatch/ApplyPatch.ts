import type { Patch } from '../Patch/Patch.ts'
import * as PatchFunctions from '../PatchFunctions/PatchFunctions.ts'
import * as PatchType from '../PatchType/PatchType.ts'
import { getEventListenerMap } from '../RegisterEventListeners/RegisterEventListeners.ts'
import * as VirtualDomElementProp from '../VirtualDomElementProp/VirtualDomElementProp.ts'

export const applyPatch = (
  $Element: Node,
  patches: readonly Patch[],
  eventMap: Record<string, any> = {},
  id: any = 0,
): void => {
  const events = getEventListenerMap(id) || eventMap
  let $Current = $Element
  console.warn('applyPatch: starting with patches:', patches.length)
  for (let patchIndex = 0; patchIndex < patches.length; patchIndex++) {
    const patch = patches[patchIndex]
    console.warn(`applyPatch: patch ${patchIndex}:`, patch.type)
    try {
      switch (patch.type) {
        case PatchType.Add:
          PatchFunctions.add($Current as HTMLElement, patch.nodes, events)
          break
        case PatchType.NavigateChild: {
          const $Child = ($Current as HTMLElement).childNodes[patch.index]
          if (!$Child) {
            console.error(
              'Cannot navigate to child: child not found at index',
              {
                $Current,
                index: patch.index,
                childCount: ($Current as HTMLElement).childNodes.length,
              },
            )
            return
          }
          $Current = $Child
          break
        }
        case PatchType.NavigateParent: {
          const $Parent = $Current.parentNode
          if (!$Parent) {
            console.error(
              'Cannot navigate to parent: current node has no parent',
              { $Current },
            )
            return
          }
          $Current = $Parent
          break
        }
        case PatchType.NavigateSibling: {
          console.warn(`NavigateSibling: index=${patch.index}`)
          const $Parent = $Current.parentNode
          console.warn(`NavigateSibling: $Parent exists=${!!$Parent}`)
          if (!$Parent) {
            console.error(
              'Cannot navigate to sibling: current node has no parent',
              { patchIndex },
            )
            return
          }
          $Current = $Parent.childNodes[patch.index]
          if (!$Current) {
            console.error(
              'Cannot navigate to sibling: sibling not found at index',
              {
                $Parent,
                index: patch.index,
                childCount: $Parent.childNodes.length,
              },
            )
            return
          }
          console.warn(`NavigateSibling: got new $Current`)
          break
        }
        case PatchType.RemoveAttribute:
          PatchFunctions.removeAttribute($Current as HTMLElement, patch.key)
          break
        case PatchType.RemoveChild:
          PatchFunctions.removeChild($Current as HTMLElement, patch.index)
          break
        case PatchType.Replace:
          console.warn('Replace: replacing current element')
          $Current = PatchFunctions.replace(
            $Current as HTMLElement,
            patch.nodes,
            events,
          )
          console.warn('Replace: done')
          break
        case PatchType.SetAttribute:
          VirtualDomElementProp.setProp(
            $Current as HTMLElement,
            patch.key,
            patch.value,
            events,
          )
          break
        case PatchType.SetText:
          PatchFunctions.setText($Current as Text, patch.value)
          break
        default:
          break
      }
    } catch (error) {
      console.error('Error applying patch at index ' + patchIndex, patch, error)
      throw error
    }
  }
}
