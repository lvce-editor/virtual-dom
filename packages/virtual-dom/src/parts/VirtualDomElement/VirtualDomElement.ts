import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import * as ElementTagMap from '../ElementTagMap/ElementTagMap.ts'
import * as VirtualDomElementProps from '../VirtualDomElementProps/VirtualDomElementProps.ts'
import * as VirtualDomElements from '../VirtualDomElements/VirtualDomElements.ts'

const renderDomTextNode = (element: any): Text => {
  return document.createTextNode(element.text)
}

const renderDomElement = (
  element: VirtualDomNode,
  eventMap: any,
  newEventMap: any,
): HTMLElement => {
  const tag = ElementTagMap.getElementTag(element.type)
  const $Element = document.createElement(tag)
  VirtualDomElementProps.setProps($Element, element, eventMap, newEventMap)
  return $Element
}

export const render = (
  element: VirtualDomNode,
  eventMap: any,
  newEventMap?: any,
): Node => {
  switch (element.type) {
    case VirtualDomElements.Text:
      return renderDomTextNode(element)
    default:
      return renderDomElement(element, eventMap, newEventMap)
  }
}
