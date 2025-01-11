import { Patch } from '../Patch/Patch.ts'
import * as PatchType from '../PatchType/PatchType.ts'

export const applyPatch = ($Element: Node, patches: readonly Patch[]): void => {
  for (const patch of patches) {
    switch (patch.type) {
      case PatchType.SetAttribute:
        ;($Element as HTMLElement).setAttribute(patch.key, patch.value)
        break
      case PatchType.RemoveAttribute:
        ;($Element as HTMLElement).removeAttribute(patch.key)
        break
      case PatchType.SetText:
        $Element.nodeValue = patch.value
        break
      case PatchType.RemoveChild:
        ;($Element as HTMLElement).children[patch.index].remove()
        break
      default:
        break
    }
  }
}
