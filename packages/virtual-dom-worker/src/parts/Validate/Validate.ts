import { VirtualDomElements } from '@lvce-editor/constants'

const validVirtualDomElementTypes = new Set<number>(
  Object.values(VirtualDomElements),
)

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const isValidNode = (node: unknown): node is Record<string, number> => {
  if (!isObject(node)) {
    return false
  }
  const { type, childCount } = node
  return (
    typeof type === 'number' &&
    Number.isSafeInteger(type) &&
    validVirtualDomElementTypes.has(type) &&
    typeof childCount === 'number' &&
    Number.isSafeInteger(childCount) &&
    childCount >= 0
  )
}

const getNodeSize = (
  nodes: readonly Record<string, number>[],
  index: number,
): number => {
  const node = nodes[index]
  let nextIndex = index + 1
  for (let i = 0; i < node.childCount; i++) {
    if (nextIndex >= nodes.length) {
      return -1
    }
    const childSize = getNodeSize(nodes, nextIndex)
    if (childSize === -1) {
      return -1
    }
    nextIndex += childSize
  }
  return nextIndex - index
}

export const validate = (nodes: unknown): boolean => {
  if (!Array.isArray(nodes)) {
    return false
  }
  for (const node of nodes) {
    if (!isValidNode(node)) {
      return false
    }
  }
  let index = 0
  while (index < nodes.length) {
    const nodeSize = getNodeSize(nodes, index)
    if (nodeSize === -1) {
      return false
    }
    index += nodeSize
  }
  return true
}
