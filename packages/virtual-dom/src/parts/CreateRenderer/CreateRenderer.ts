import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import * as AttachEvent from '../AttachEvent/AttachEvent.ts'
import * as ElementTagMap from '../ElementTagMap/ElementTagMap.ts'
import * as RenderInternal from '../RenderInternal/RenderInternal.ts'
import * as VirtualDomElement from '../VirtualDomElement/VirtualDomElement.ts'
import * as VirtualDomElementProps from '../VirtualDomElementProps/VirtualDomElementProps.ts'
import * as VirtualDomElements from '../VirtualDomElements/VirtualDomElements.ts'

export interface RendererOptions {
  readonly cache?: { readonly dom?: number; readonly text?: number }
}

const safeTags = new Set([
  'div',
  'span',
  'p',
  'section',
  'header',
  'footer',
  'main',
  'nav',
])
const safeProps = new Set([
  'type',
  'childCount',
  'id',
  'className',
  'title',
  'role',
  'style',
])

const validateLimit = (limit: number): number => {
  if (!Number.isSafeInteger(limit) || limit < 0) {
    throw new RangeError('Cache limits must be nonnegative safe integers')
  }
  return limit
}

/** Experimental: exclusively owns its rendered trees until dispose is called. */
export interface Renderer {
  readonly clearCache: () => void
  readonly dispose: (root: HTMLElement) => void
  readonly render: (
    nodes: readonly VirtualDomNode[],
    eventMap?: any,
    newEventMap?: any,
  ) => HTMLElement
}

export const createRenderer = (options: RendererOptions = {}): Renderer => {
  const domLimit = validateLimit(options.cache?.dom ?? 0)
  const textLimit = validateLimit(options.cache?.text ?? 0)
  const elements: HTMLElement[] = []
  const texts: Text[] = []
  const owned = new WeakSet<Node>()
  const recyclable = new WeakSet<Node>()
  const roots = new WeakSet<HTMLElement>()

  const renderElement = (
    node: VirtualDomNode,
    eventMap: any,
    newEventMap?: any,
  ): Node => {
    if (node.type === VirtualDomElements.Reference) {
      return VirtualDomElement.render(node, eventMap, newEventMap)
    }
    let result: Node
    if (node.type === VirtualDomElements.Text) {
      const text = texts.pop() || document.createTextNode('')
      text.data = node.text
      result = text
    } else {
      const tag = ElementTagMap.getElementTag(node.type)
      const index = elements.findIndex(
        (element) =>
          element.localName === tag && element.ownerDocument === document,
      )
      if (index === -1) {
        result = VirtualDomElement.render(node, eventMap, newEventMap)
      } else {
        const element = elements.splice(index, 1)[0]
        VirtualDomElementProps.setProps(element, node, eventMap, newEventMap)
        result = element
      }
      recyclable.delete(result)
      if (
        safeTags.has(tag) &&
        Object.keys(node).every(
          (key) =>
            safeProps.has(key) ||
            key.startsWith('aria-') ||
            key.startsWith('data-') ||
            key.startsWith('on'),
        )
      ) {
        recyclable.add(result)
      }
    }
    owned.add(result)
    return result
  }

  const collect = (node: Node): void => {
    if (!owned.has(node)) {
      return
    }
    owned.delete(node)
    for (const child of node.childNodes) {
      collect(child)
    }
    if (node instanceof Text) {
      node.data = ''
      if (texts.length < textLimit) {
        texts.push(node)
      }
    } else if (node instanceof Element) {
      AttachEvent.detachAll(node)
      node.replaceChildren()
      if (
        node instanceof HTMLElement &&
        recyclable.has(node) &&
        Object.getOwnPropertyNames(node).length === 0
      ) {
        for (const attribute of node.attributes) {
          node.removeAttribute(attribute.name)
        }
        node.scrollTop = 0
        node.scrollLeft = 0
        if (elements.length < domLimit) {
          elements.push(node)
        }
      }
    }
  }

  const dispose = (root: HTMLElement): void => {
    if (!roots.has(root)) {
      return
    }
    roots.delete(root)
    root.remove()
    for (const child of root.childNodes) {
      collect(child)
    }
    root.replaceChildren()
  }

  const render = (
    nodes: readonly VirtualDomNode[],
    eventMap = {},
    newEventMap = {},
  ): HTMLElement => {
    const root = document.createElement('div')
    RenderInternal.renderInternal(
      root,
      nodes,
      eventMap,
      newEventMap,
      renderElement,
    )
    roots.add(root)
    return root
  }

  const clearCache = (): void => {
    elements.length = 0
    texts.length = 0
  }

  return { render, dispose, clearCache }
}
