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
    type: VirtualDomElements.P,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Paragraph',
    childCount: 0,
  },
]

renderInto($container, initialDom)

const updatedDom = [
  {
    type: VirtualDomElements.Div,
    childCount: 5,
  },
  {
    type: VirtualDomElements.H1,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Title',
    childCount: 0,
  },
  {
    type: VirtualDomElements.P,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Paragraph',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Button,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Click',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Span,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Footer',
    childCount: 0,
  },
]

const patches = diff(initialDom, updatedDom)
const $root = $container.firstElementChild
applyPatch($root, patches)

window.__virtualDomDiffTestComplete = true
