import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'

export interface AddPatch {
  readonly type: 6
  readonly index: number
  readonly nodes: readonly VirtualDomNode[]
}
