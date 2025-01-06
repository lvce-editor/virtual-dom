import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'

export interface ReplacePatch {
  readonly type: 2
  readonly index: number
  readonly node: VirtualDomNode
}
