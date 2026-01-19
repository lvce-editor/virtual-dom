import { renderInto } from '/dist/virtual-dom/dist/index.js'
import { VirtualDomElements } from '/dist/virtual-dom-worker/dist/index.js'

const $root = document.getElementById('root')

const virtualDom = [
  {
    type: VirtualDomElements.Div,
    id: 'test-div',
    className: 'test-class',
    childCount: 2,
  },
  {
    type: VirtualDomElements.Span,
    text: 'Hello',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Span,
    text: 'World',
    childCount: 0,
  },
]

renderInto($root, virtualDom)

window.__virtualDomTestComplete = true
