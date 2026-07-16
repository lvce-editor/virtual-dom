import type { Patch } from '../Patch/Patch.ts'
import * as PatchType from '../PatchType/PatchType.ts'

export const removeTrailingNavigationPatches = (patches: Patch[]): Patch[] => {
  while (patches.length > 0) {
    const patch = patches[patches.length - 1]
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
