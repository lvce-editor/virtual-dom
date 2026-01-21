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
  for (const patch of patches) {
    switch (patch.type) {
      case PatchType.Add:
        PatchFunctions.add($Current as HTMLElement, patch.nodes, events)
        break
      case PatchType.NavigateChild:
        $Current = ($Current as HTMLElement).childNodes[patch.index]
        break
      case PatchType.NavigateParent:
        $Current = $Current.parentNode as HTMLElement
        break
      case PatchType.NavigateSibling:
        $Current = ($Current.parentNode as HTMLElement).childNodes[patch.index]
        break
      case PatchType.RemoveAttribute:
        PatchFunctions.removeAttribute($Current as HTMLElement, patch.key)
        break
      case PatchType.RemoveChild:
        PatchFunctions.removeChild($Current as HTMLElement, patch.index)
        break
      case PatchType.Replace:
        $Current = PatchFunctions.replace(
          $Current as HTMLElement,
          patch.nodes,
          events,
        )
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
  }
}
