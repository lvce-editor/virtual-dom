import { Patch } from '../Patch/Patch.ts'
import * as PatchType from '../PatchType/PatchType.ts'

export const applyPatch = (
  $Element: HTMLElement,
  patches: readonly Patch[],
) => {
  for (const patch of patches) {
    switch (patch.type) {
      case PatchType.SetAttribute:
        $Element.setAttribute(patch.key, patch.value)
        break
      default:
        break
    }
  }
}
