import type { AttributePatch } from '../AttributePatch/AttributePatch.ts'
import type { ReplacePatch } from '../ReplacePatch/ReplacePatch.ts'
import type { TextPatch } from '../TextPatch/TextPatch.ts'
import type { RemoveAttributePatch } from '../RemoveAttributePatch/RemoveAttributePatch.ts'

export type Patch =
  | TextPatch
  | AttributePatch
  | ReplacePatch
  | RemoveAttributePatch
