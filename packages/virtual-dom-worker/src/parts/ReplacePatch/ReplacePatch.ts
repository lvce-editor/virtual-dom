import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'

export interface ReplacePatch {
  readonly index: number
  readonly node: VirtualDomNode
  readonly type: 2
}
