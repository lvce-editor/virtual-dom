import { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'

const isKey = (key: string): boolean => {
  return key !== 'type' && key !== 'childCount'
}

export const getKeys = (node: VirtualDomNode): readonly string[] => {
  const keys = Object.keys(node).filter(isKey)
  return keys
}
