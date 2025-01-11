import type { Patch } from '../Patch/Patch.ts'
import * as PatchType from '../PatchType/PatchType.ts'

export const applyPendingPatches = (
  patches: Patch[],
  pendingPatches: number[],
  skip: number,
): void => {
  for (let k = 0; k < pendingPatches.length - skip; k += 2) {
    const type = pendingPatches[k]
    const index = pendingPatches[k + 1]
    if (type === PatchType.NavigateParent) {
      patches.push({ type })
    } else {
      patches.push({
        type,
        index,
      } as Patch)
    }
  }
  pendingPatches.length = 0
}
