import { Patch } from '../Patch/Patch.ts'
import * as PatchType from '../PatchType/PatchType.ts'
import * as PatchFunctions from '../PatchFunctions/PatchFunctions.ts'

export const applyPatch = ($Element: Node, patches: readonly Patch[]): void => {
  for (const patch of patches) {
    switch (patch.type) {
      case PatchType.SetAttribute:
        PatchFunctions.setAttribute(
          $Element as HTMLElement,
          patch.key,
          patch.value,
        )
        break
      case PatchType.RemoveAttribute:
        PatchFunctions.removeAttribute($Element as HTMLElement, patch.key)
        break
      case PatchType.SetText:
        PatchFunctions.setText($Element as Text, patch.value)
        break
      case PatchType.RemoveChild:
        PatchFunctions.removeChild($Element as HTMLElement, patch.index)
        break
      default:
        break
    }
  }
}
