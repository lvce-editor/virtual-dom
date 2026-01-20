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
    childCount: 3,
  },
  {
    type: VirtualDomElements.Span,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'A',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Span,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'B',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Span,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'C',
    childCount: 0,
  },
]

renderInto($container, initialDom)

const updatedDom = [
  {
    type: VirtualDomElements.Div,
    childCount: 3,
  },
  {
    type: VirtualDomElements.Span,
    className: 'updated',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'A Updated',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Span,
    className: 'updated',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'B Updated',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Span,
    className: 'updated',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'C Updated',
    childCount: 0,
  },
]

const patches = diff(initialDom, updatedDom)
const $root = $container.firstElementChild
applyPatch($root, patches)

window.__virtualDomDiffTestComplete = true
