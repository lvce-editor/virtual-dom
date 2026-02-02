import type { AddPatch } from '../AddPatch/AddPatch.ts'
import type { AttributePatch } from '../AttributePatch/AttributePatch.ts'
import type { NavigateChildPatch } from '../NavigateChildPatch/NavigateChildPatch.ts'
import type { NavigateParentPatch } from '../NavigateParentPatch/NavigateParentPatch.ts'
import type { NavigateSiblingPatch } from '../NavigateSiblingPatch/NavigateSiblingPatch.ts'
import type { RemoveAttributePatch } from '../RemoveAttributePatch/RemoveAttributePatch.ts'
import type { RemoveChildPatch } from '../RemoveChildPatch/RemoveChildPatch.ts'
import type { RemovePatch } from '../RemovePatch/RemovePatch.ts'
import type { ReplacePatch } from '../ReplacePatch/ReplacePatch.ts'
import type { SetReferenceNodeUidPatch } from '../SetReferenceNodeUidPatch/SetReferenceNodeUidPatch.ts'
import type { TextPatch } from '../TextPatch/TextPatch.ts'

export type Patch =
  | TextPatch
  | AttributePatch
  | ReplacePatch
  | RemoveAttributePatch
  | RemovePatch
  | AddPatch
  | NavigateChildPatch
  | NavigateParentPatch
  | RemoveChildPatch
  | NavigateSiblingPatch
  | SetReferenceNodeUidPatch
