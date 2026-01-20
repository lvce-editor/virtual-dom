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
    childCount: 2,
  },
  {
    type: VirtualDomElements.Td,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Cell 1',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Td,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Cell 2',
    childCount: 0,
  },
]

renderInto($container, initialDom)

const updatedDom = [
  {
    type: VirtualDomElements.Table,
    className: 'data-table',
    childCount: 2,
  },
  {
    type: VirtualDomElements.Tr,
    childCount: 2,
  },
  {
    type: VirtualDomElements.Td,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Cell 1',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Td,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Cell 2',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Tr,
    childCount: 2,
  },
  {
    type: VirtualDomElements.Td,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Cell 3',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Td,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Cell 4',
    childCount: 0,
  },
]

const patches = diff(initialDom, updatedDom)
const $root = $container.firstElementChild
applyPatch($root, patches)

window.__virtualDomDiffTestComplete = true
