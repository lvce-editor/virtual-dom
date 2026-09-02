import type { Patch } from '../Patch/Patch.ts'
import * as PatchType from '../PatchType/PatchType.ts'

export const applyPendingPatches = (
  patches: Patch[],
  pendingPatches: number[],
  skip: number,
): void => {
  const navigationCount = pendingPatches.length - skip
  if (navigationCount > 2) {
    patches.push({
      navigations: pendingPatches.slice(0, navigationCount),
      type: PatchType.MultiNavigation,
    })
  } else if (navigationCount === 2) {
    const type = pendingPatches[0]
    const index = pendingPatches[1]
    patches.push(
      type === PatchType.NavigateParent ? { type } : ({ index, type } as Patch),
    )
  }
  pendingPatches.length = 0
}
