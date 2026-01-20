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

  // The target path is path + currentIndex
  // But if path already includes the current position, we need to check differently
  // When comparing nodes at path [0, 0], we're already at [0, 0]
  // So if path is [0, 0] and currentIndex is 0, the target is [0, 0] (not [0, 0, 0])
  // We're comparing the node at path, not its child
  const targetPath = [...path]
  
  // If we're already at the target path, don't add navigation
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
