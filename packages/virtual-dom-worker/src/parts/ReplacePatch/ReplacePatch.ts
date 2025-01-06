import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'

export interface ReplacePatch {
  type: 'replace'
  index: number
  node: VirtualDomNode
}
