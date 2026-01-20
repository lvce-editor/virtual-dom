import {
  renderInto,
  applyPatch,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'
import { diffTree } from '/dist/virtual-dom-worker/dist/index.js'

const $container = document.getElementById('diff-container')

const initialDom = [
  {
    type: VirtualDomElements.Div,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Ul,
    childCount: 2,
  },
  {
    type: VirtualDomElements.Li,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Item 1',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Li,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Item 2',
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
    type: VirtualDomElements.Ul,
    childCount: 2,
  },
  {
    type: VirtualDomElements.Li,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Item 1',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Li,
    childCount: 2,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Item 2',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Ul,
    childCount: 2,
  },
  {
    type: VirtualDomElements.Li,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Subitem 1',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Li,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Subitem 2',
    childCount: 0,
  },
]

const patches = diff(initialDom, updatedDom)
const $root = $container.firstElementChild
applyPatch($root, patches)

window.__virtualDomDiffTestComplete = true
