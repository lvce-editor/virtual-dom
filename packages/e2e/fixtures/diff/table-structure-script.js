import {
  renderInto,
  applyPatch,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'
import { diffTree } from '/dist/virtual-dom-worker/dist/index.js'

const $container = document.getElementById('diff-container')

const initialDom = [
  {
    type: VirtualDomElements.Table,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Tr,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Td,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Old Cell',
    childCount: 0,
  },
]

renderInto($container, initialDom)

const updatedDom = [
  {
    type: VirtualDomElements.Table,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Tr,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Td,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'New Cell',
    childCount: 0,
  },
]

const patches = diffTree(initialDom, updatedDom)
const $root = $container.firstElementChild
applyPatch($root, patches)

window.__virtualDomDiffTestComplete = true
