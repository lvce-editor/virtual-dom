import { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'

export const getKeys = (node: VirtualDomNode): readonly string[] => {
  const keys = Object.keys(node).filter(
    (key) => key !== 'type' && key !== 'childCount',
  )
  return keys
}
