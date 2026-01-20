import type { Patch } from '../Patch/Patch.ts'
import * as PatchType from '../PatchType/PatchType.ts'

export const addNavigationPatches = (
  patches: Patch[],
  path: number[],
  currentIndex: number,
  currentPath: number[] = [],
): void => {
  // Only add navigation if we're not at the root
  if (path.length === 0 && currentIndex === 0) {
    return
  }

  // If we're already at the target path, don't add navigation
  const targetPath = [...path, currentIndex]
  if (
    currentPath.length === targetPath.length &&
    currentPath.every((val, idx) => val === targetPath[idx])
  ) {
    // Only add sibling navigation if needed
    if (currentIndex > 0) {
      patches.push({
        type: PatchType.NavigateSibling,
        index: currentIndex,
      })
    }
    return
  }

  // Navigate to the correct position
  for (let i = 0; i < path.length; i++) {
    patches.push({
      type: PatchType.NavigateChild,
      index: path[i],
    })
  }

  // Navigate to sibling if needed
  if (currentIndex > 0) {
    patches.push({
      type: PatchType.NavigateSibling,
      index: currentIndex,
    })
  }
}
