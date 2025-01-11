import * as VirtualDomElement from '../VirtualDomElement/VirtualDomElement.ts'

export const renderInternal = (
  $Parent: HTMLElement,
  elements: readonly any[],
  eventMap: any,
  newEventMap?: any,
) => {
  const max = elements.length - 1
  let stack: Node[] = []
  for (let i = max; i >= 0; i--) {
    const element = elements[i]
    const $Element = VirtualDomElement.render(element, eventMap, newEventMap)
    if (element.childCount > 0) {
      // @ts-expect-error
      $Element.append(...stack.slice(0, element.childCount))
      stack = stack.slice(element.childCount)
    }
    stack.unshift($Element)
  }
  $Parent.append(...stack)
}
