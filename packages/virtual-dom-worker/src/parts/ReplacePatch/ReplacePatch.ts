import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'

export interface ReplacePatch {
  readonly nodes: readonly VirtualDomNode[]
  readonly type: 2
}
