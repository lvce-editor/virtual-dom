import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'

export interface AddPatch {
  readonly nodes: readonly VirtualDomNode[]
  readonly type: 6
}
