import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'

export interface AddPatch {
  readonly type: 6
  readonly nodes: readonly VirtualDomNode[]
}
