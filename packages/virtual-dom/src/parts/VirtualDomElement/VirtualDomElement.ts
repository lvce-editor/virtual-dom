import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import * as ElementTagMap from '../ElementTagMap/ElementTagMap.ts'
import * as Instances from '../Instances/Instances.ts'
import * as VirtualDomElementProps from '../VirtualDomElementProps/VirtualDomElementProps.ts'
import * as VirtualDomElements from '../VirtualDomElements/VirtualDomElements.ts'

const svgNamespace = 'http://www.w3.org/2000/svg'

const svgElementTypes = new Set([
  VirtualDomElements.Circle,
  VirtualDomElements.Defs,
  VirtualDomElements.Ellipse,
  VirtualDomElements.G,
  VirtualDomElements.Line,
  VirtualDomElements.Path,
  VirtualDomElements.Polygon,
  VirtualDomElements.Polyline,
  VirtualDomElements.Rect,
  VirtualDomElements.Svg,
  VirtualDomElements.Use,
])

const renderDomTextNode = (element: any): Text => {
  return document.createTextNode(element.text)
}

const renderDomElement = (
  element: VirtualDomNode,
  eventMap: any,
  newEventMap: any,
): Element => {
  const tag = ElementTagMap.getElementTag(element.type)
  const $Element = svgElementTypes.has(element.type)
    ? document.createElementNS(svgNamespace, tag)
    : document.createElement(tag)
  VirtualDomElementProps.setProps($Element, element, eventMap, newEventMap)
  return $Element
}

const renderReferenceNode = (
  element: VirtualDomNode,
  eventMap: any,
  newEventMap: any,
): any => {
  const instance = Instances.get(element.uid)
  if (!instance || !instance.state) {
    return document.createTextNode('Reference node not found')
  }
  const $Node = instance.state.$Viewlet
  const props = Object.fromEntries(
    Object.entries(element).filter(([key]) => key !== 'uid'),
  )
  VirtualDomElementProps.setProps($Node, props, eventMap, newEventMap)
  return $Node
}

export const render = (
  element: VirtualDomNode,
  eventMap: any,
  newEventMap?: any,
): Node => {
  switch (element.type) {
    case VirtualDomElements.Reference:
      return renderReferenceNode(element, eventMap, newEventMap)
    case VirtualDomElements.Text:
      return renderDomTextNode(element)
    default:
      return renderDomElement(element, eventMap, newEventMap)
  }
}
