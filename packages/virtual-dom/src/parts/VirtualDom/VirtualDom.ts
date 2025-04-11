import * as ClearNode from '../ClearNode/ClearNode.ts'
import * as RenderInternal from '../RenderInternal/RenderInternal.ts'

export const renderInto = ($Parent, dom, eventMap = {}): void => {
  ClearNode.clearNode($Parent)
  RenderInternal.renderInternal($Parent, dom, eventMap)
}

export const renderIncremental = ($Parent, dom): void => {
  if ($Parent.textContent === '') {
    // @ts-expect-error
    renderInternal($Parent, dom)
    return
  }
  // TODO
  const $Node = $Parent
  for (let i = 0; i < dom.length; i++) {
    const node = dom[i]
    if ($Node.nodeValue !== node.props.text && node.props.text) {
      $Node.nodeValue = node.props.text
    }
    if ($Node.title !== node.props.title && node.props.title) {
      $Node.title = node.props.title
    }
  }
  // const newCount = dom
  // const $Root = render(dom)
  // $Parent.replaceChildren(...$Root.children)
}

/**
 *
 * @param {any[]} elements
 * @returns
 */
export const render = (
  elements,
  eventMap = {},
  newEventMap = {},
): HTMLElement => {
  const $Root = document.createElement('div')
  RenderInternal.renderInternal($Root, elements, eventMap, newEventMap)
  return $Root
}
