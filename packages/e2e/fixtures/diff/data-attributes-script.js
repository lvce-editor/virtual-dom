import {
  renderInto,
  applyPatch,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'
import { diff } from '/dist/virtual-dom-worker/dist/index.js'

const $container = document.getElementById('diff-container')

const initialDom = [
  {
    type: VirtualDomElements.Div,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Span,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Content',
    childCount: 0,
  },
]

renderInto($container, initialDom)

const updatedDom = [
  {
    type: VirtualDomElements.Div,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Span,
    'data-testid': 'test-span',
    'data-value': '123',
    'data-status': 'active',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Content',
    childCount: 0,
  },
]

const patches = diff(initialDom, updatedDom)
const $root = $container.firstElementChild
applyPatch($root, patches)

window.__virtualDomDiffTestComplete = true
