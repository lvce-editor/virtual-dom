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
    type: VirtualDomElements.Section,
    childCount: 1,
  },
  {
    type: VirtualDomElements.P,
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
    childCount: 2,
  },
  {
    type: VirtualDomElements.Section,
    className: 'main-content',
    childCount: 1,
  },
  {
    type: VirtualDomElements.P,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Main Content',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Aside,
    className: 'sidebar',
    childCount: 1,
  },
  {
    type: VirtualDomElements.P,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Sidebar Content',
    childCount: 0,
  },
]

const patches = diffTree(initialDom, updatedDom)
const $root = $container.firstElementChild
applyPatch($root, patches)

window.__virtualDomDiffTestComplete = true
