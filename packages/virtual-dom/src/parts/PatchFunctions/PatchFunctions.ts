import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import * as RenderInternal from '../RenderInternal/RenderInternal.ts'

// Map of property names to attribute names for cases where they differ
const propertyToAttribute: Record<string, string> = {
  className: 'class',
  htmlFor: 'for',
}

// Style properties that need to be set on element.style
const styleProperties = new Set([
  'width',
  'height',
  'top',
  'left',
  'marginTop',
  'paddingLeft',
  'paddingRight',
])

export const setAttribute = (
  $Element: HTMLElement,
  key: string,
  value: any,
): void => {
  // Handle style properties
  if (styleProperties.has(key)) {
    // @ts-ignore - dynamic style property access
    $Element.style[key] = typeof value === 'number' ? `${value}px` : value
    return
  }

  // Handle special cases where property name differs from attribute name
  const attributeName = propertyToAttribute[key] || key
  // Use property assignment for known DOM properties, attribute for others
  if (key in $Element) {
    // @ts-ignore - dynamic property access
    $Element[key] = value
  } else {
    $Element.setAttribute(attributeName, value)
  }
}

export const removeAttribute = ($Element: HTMLElement, key: string): void => {
  // Handle style properties
  if (styleProperties.has(key)) {
    // @ts-ignore - dynamic style property access
    $Element.style[key] = ''
    return
  }

  const attributeName = propertyToAttribute[key] || key
  $Element.removeAttribute(attributeName)
}

export const setText = ($Element: Text, value: string): void => {
  $Element.nodeValue = value
}

export const removeChild = ($Element: HTMLElement, index: number): void => {
  const $Child = $Element.children[index]
  $Child.remove()
}

export const add = (
  $Element: HTMLElement,
  nodes: readonly VirtualDomNode[],
): void => {
  RenderInternal.renderInternal($Element, nodes, {}, {})
}

export const replace = (
  $Element: HTMLElement,
  nodes: readonly VirtualDomNode[],
): HTMLElement => {
  // Create a temporary container to render the new nodes
  const $Temp = document.createElement('div')
  RenderInternal.renderInternal($Temp, nodes, {}, {})
  // Replace the current element with the new ones
  const $NewElement = $Temp.firstElementChild as HTMLElement
  $Element.replaceWith($NewElement)
  return $NewElement
}
