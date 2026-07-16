import type { Patch } from '../Patch/Patch.ts'
import * as PatchType from '../PatchType/PatchType.ts'

export const removeTrailingNavigationPatches = (patches: Patch[]): Patch[] => {
  while (patches.length > 0) {
    const patch = patches.at(-1) as Patch
    if (
      patch.type !== PatchType.NavigateChild &&
      patch.type !== PatchType.NavigateParent &&
      patch.type !== PatchType.NavigateSibling
    ) {
      break
    }
    patches.pop()
  }
  return patches
}
