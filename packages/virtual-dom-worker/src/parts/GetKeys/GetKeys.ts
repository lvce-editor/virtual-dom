import * as IsKey from '../IsKey/IsKey.ts'
import { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'

export const getKeys = (node: VirtualDomNode): readonly string[] => {
  const keys = Object.keys(node).filter(IsKey.isKey)
  return keys
}
