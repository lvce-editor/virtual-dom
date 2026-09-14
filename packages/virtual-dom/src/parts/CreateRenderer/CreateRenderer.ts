import type { ApplyPatchOptions } from '../ApplyPatch/ApplyPatch.ts'
import type { Patch } from '../Patch/Patch.ts'
import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import * as ApplyPatch from '../ApplyPatch/ApplyPatch.ts'
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
  readonly applyPatch: (
    element: Node,
    patches: readonly Patch[],
    eventMap?: Record<string, any>,
    id?: any,
  ) => void
  readonly clearCache: () => void
  readonly dispose: (root: HTMLElement) => void
  readonly render: (
    nodes: readonly VirtualDomNode[],
    eventMap?: any,
    newEventMap?: any,
  ) => HTMLElement
  readonly renderInto: (
    parent: HTMLElement,
    nodes: readonly VirtualDomNode[],
    eventMap?: any,
    newEventMap?: any,
  ) => void
}

export const createRenderer = (options: RendererOptions = {}): Renderer => {
  const domLimit = validateLimit(options.cache?.dom ?? 0)
  const textLimit = validateLimit(options.cache?.text ?? 0)
  const elements: HTMLElement[] = []
  const texts: Text[] = []
  const owned = new WeakSet<Node>()
  const recyclable = new WeakSet<Node>()
  const rootNodes = new Map<HTMLElement, Set<Node>>()
  const rootByNode = new WeakMap<Node, HTMLElement>()
  const parentRoots = new WeakMap<HTMLElement, HTMLElement>()
  let activeRoot: HTMLElement | undefined

  const rememberNode = (node: Node): void => {
    owned.add(node)
    if (activeRoot) {
      rootNodes.get(activeRoot)?.add(node)
      rootByNode.set(node, activeRoot)
    }
  }

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
    rememberNode(result)
    return result
  }

  const collect = (node: Node | undefined): void => {
    if (!node || !owned.has(node)) {
      return
    }
    owned.delete(node)
    rootByNode.delete(node)
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
        for (const name of node.getAttributeNames()) {
          node.removeAttribute(name)
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
    const trackedRoot = rootNodes.has(root) ? root : parentRoots.get(root)
    if (!trackedRoot) {
      return
    }
    const nodes = rootNodes.get(trackedRoot)
    rootNodes.delete(trackedRoot)
    trackedRoot.remove()
    const nodesToCollect = nodes || []
    for (const node of nodesToCollect) {
      collect(node)
    }
    trackedRoot.replaceChildren()
  }

  const render = (
    nodes: readonly VirtualDomNode[],
    eventMap = {},
    newEventMap = {},
  ): HTMLElement => {
    const root = document.createElement('div')
    rootNodes.set(root, new Set())
    activeRoot = root
    try {
      RenderInternal.renderInternal(
        root,
        nodes,
        eventMap,
        newEventMap,
        renderElement,
      )
    } finally {
      activeRoot = undefined
    }
    return root
  }

  const renderInto = (
    parent: HTMLElement,
    nodes: readonly VirtualDomNode[],
    eventMap = {},
    newEventMap = {},
  ): void => {
    dispose(parent)
    const root = render(nodes, eventMap, newEventMap)
    parent.replaceChildren(...root.childNodes)
    parentRoots.set(parent, root)
  }

  const getRoot = (node: Node): HTMLElement | undefined => {
    let current: Node | null = node
    while (current) {
      const root = rootByNode.get(current)
      if (root) {
        return root
      }
      current = current.parentNode
    }
    return undefined
  }

  const applyPatch = (
    element: Node,
    patches: readonly Patch[],
    eventMap = {},
    id: any = 0,
  ): void => {
    const root = getRoot(element)
    activeRoot = root
    try {
      const options: ApplyPatchOptions = {
        onRemove: collect,
        renderElement,
      }
      ApplyPatch.applyPatch(element, patches, eventMap, id, options)
    } finally {
      activeRoot = undefined
    }
  }

  const clearCache = (): void => {
    elements.length = 0
    texts.length = 0
  }

  return { applyPatch, render, renderInto, dispose, clearCache }
}
