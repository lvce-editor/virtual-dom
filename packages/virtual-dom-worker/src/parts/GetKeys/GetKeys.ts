import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import * as IsKey from '../IsKey/IsKey.ts'

export const getKeys = (node: VirtualDomNode): readonly string[] => {
  const keys = Object.keys(node).filter(IsKey.isKey)
  return keys
}
