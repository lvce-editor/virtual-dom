import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import * as RenderInternal from '../RenderInternal/RenderInternal.ts'

// Map of property names to attribute names for cases where they differ
const propertyToAttribute: Record<string, string> = {
  className: 'class',
  htmlFor: 'for',
  ariaActivedescendant: 'aria-activedescendant',
  ariaControls: 'aria-controls',
  ariaLabelledBy: 'aria-labelledby',
  ariaOwns: 'aria-owns',
  inputType: 'type',
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
  const $Child = $Element.childNodes[index]
  if ($Child) {
    $Child.remove()
  }
}

export const add = (
  $Element: HTMLElement,
  nodes: readonly VirtualDomNode[],
  eventMap: Record<string, any> = {},
): void => {
  RenderInternal.renderInternal($Element, nodes, eventMap, eventMap)
}

export const replace = (
  $Element: HTMLElement,
  nodes: readonly VirtualDomNode[],
  eventMap: Record<string, any> = {},
): HTMLElement => {
  // Create a temporary container to render the new nodes
  const $Temp = document.createElement('div')
  RenderInternal.renderInternal($Temp, nodes, eventMap, eventMap)
  // Replace the current element with the new ones
  let $NewElement = $Temp.firstElementChild as HTMLElement | null

  if (!$NewElement) {
    // If no element was created (e.g., only text nodes), we need to create a wrapper
    // In this case, we create a div and move all children to it
    $NewElement = document.createElement('div')
    while ($Temp.firstChild) {
      $NewElement.append($Temp.firstChild)
    }
  }

  $Element.replaceWith($NewElement)
  return $NewElement
}
