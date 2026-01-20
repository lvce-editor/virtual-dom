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
  // The target path is the path to the node we want to patch
  // If path is [0, 0] and currentIndex is 0, we're patching the node at [0, 0]
  // (not [0, 0, 0] - that would be a child of [0, 0])
  const targetPath = path.length > 0 ? [...path.slice(0, -1), path[path.length - 1] + currentIndex] : [currentIndex]
  if (currentPath.length === 0 && path.length === 0 && currentIndex === 0) {
    return
  }
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
