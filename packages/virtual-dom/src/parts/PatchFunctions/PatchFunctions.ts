import * as RenderInternal from '../RenderInternal/RenderInternal.ts'
import { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'

export const setAttribute = (
  $Element: HTMLElement,
  key: string,
  value: any,
): void => {
  $Element.setAttribute(key, value)
}

export const removeAttribute = ($Element: HTMLElement, key: string): void => {
  $Element.removeAttribute(key)
}

export const setText = ($Element: Text, value: string): void => {
  $Element.nodeValue = value
}

export const removeChild = ($Element: HTMLElement, index: number): void => {
  console.log('el', $Element.className)
  console.log('index', index)
  console.log('ch', $Element.children.length)
  const $Child = $Element.children[index]
  $Child.remove()
}

export const add = (
  $Element: HTMLElement,
  nodes: readonly VirtualDomNode[],
): void => {
  RenderInternal.renderInternal($Element, nodes, {}, {})
}
