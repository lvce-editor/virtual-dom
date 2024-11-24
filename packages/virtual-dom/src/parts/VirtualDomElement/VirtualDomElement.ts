import * as ElementTagMap from '../ElementTagMap/ElementTagMap.ts'
import * as VirtualDomElementProps from '../VirtualDomElementProps/VirtualDomElementProps.ts'
import * as VirtualDomElements from '../VirtualDomElements/VirtualDomElements.ts'

const renderDomTextNode = (element) => {
  return document.createTextNode(element.text)
}

const renderDomElement = (element, eventMap, newEventMap) => {
  const tag = ElementTagMap.getElementTag(element.type)
  const $Element = document.createElement(tag)
  VirtualDomElementProps.setProps($Element, element, eventMap, newEventMap)
  return $Element
}

export const render = (element, eventMap, newEventMap) => {
  switch (element.type) {
    case VirtualDomElements.Text:
      return renderDomTextNode(element)
    default:
      return renderDomElement(element, eventMap, newEventMap)
  }
}
