import type { Patch } from '../Patch/Patch.ts'
import * as PatchType from '../PatchType/PatchType.ts'

export const removeTrailingNavigationPatches = (patches: Patch[]): Patch[] => {
  // Find the last non-navigation patch
  let lastNonNavigationIndex = -1
  for (let i = patches.length - 1; i >= 0; i--) {
    const patch = patches[i]
    if (
      patch.type !== PatchType.NavigateChild &&
      patch.type !== PatchType.NavigateParent &&
      patch.type !== PatchType.NavigateSibling
    ) {
      lastNonNavigationIndex = i
      break
    }
  }

  // Return patches up to and including the last non-navigation patch
  return lastNonNavigationIndex === -1
    ? []
    : patches.slice(0, lastNonNavigationIndex + 1)
}
