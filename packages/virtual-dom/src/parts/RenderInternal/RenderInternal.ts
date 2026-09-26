import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import * as VirtualDomElement from '../VirtualDomElement/VirtualDomElement.ts'

export const renderInternal = (
  $Parent: HTMLElement,
  elements: readonly VirtualDomNode[],
  eventMap: any,
  newEventMap?: any,
  renderElement = VirtualDomElement.render,
): void => {
  const max = elements.length - 1
  const stack: Node[] = []
  for (let i = max; i >= 0; i--) {
    const element = elements[i]
    const $Element = renderElement(element, eventMap, newEventMap)
    if (element.childCount > 0) {
      for (let child = 0; child < element.childCount; child++) {
        ;($Element as ParentNode).append(stack.pop()!)
      }
    }
    stack.push($Element)
  }
  while (stack.length > 0) {
    $Parent.append(stack.pop()!)
  }
}
