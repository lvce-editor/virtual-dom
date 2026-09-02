import type { Patch } from '../Patch/Patch.ts'
import * as PatchType from '../PatchType/PatchType.ts'

const isNavigationPatch = (patch: Patch): boolean => {
  switch (patch.type) {
    case PatchType.NavigateChild:
    case PatchType.NavigateParent:
    case PatchType.NavigateSibling:
      return true
    default:
      return false
  }
}

const getNavigationIndex = (patch: Patch): number => {
  switch (patch.type) {
    case PatchType.NavigateChild:
    case PatchType.NavigateSibling:
      return patch.index
    default:
      return 0
  }
}

export const appendNavigationPatch = (
  patches: Patch[],
  type: number,
  index: number,
): void => {
  const previousPatch = patches.at(-1)
  if (!previousPatch) {
    patches.push(
      type === PatchType.NavigateParent ? { type } : ({ index, type } as Patch),
    )
    return
  }
  if (previousPatch.type === PatchType.MultiNavigation) {
    previousPatch.navigations.push(type, index)
    return
  }
  if (isNavigationPatch(previousPatch)) {
    patches[patches.length - 1] = {
      navigations: [
        previousPatch.type,
        getNavigationIndex(previousPatch),
        type,
        index,
      ],
      type: PatchType.MultiNavigation,
    }
    return
  }
  patches.push(
    type === PatchType.NavigateParent ? { type } : ({ index, type } as Patch),
  )
}
