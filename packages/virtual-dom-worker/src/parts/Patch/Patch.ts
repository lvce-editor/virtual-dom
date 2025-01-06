import type { AttributePatch } from '../AttributePatch/AttributePatch.ts'
import type { ReplacePatch } from '../ReplacePatch/ReplacePatch.ts'
import type { TextPatch } from '../TextPatch/TextPatch.ts'

export type Patch = TextPatch | AttributePatch | ReplacePatch
