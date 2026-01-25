import {
  renderInto,
  applyPatch,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'
import { diffTree } from '/dist/virtual-dom-worker/dist/index.js'

const $container = document.getElementById('diff-container')

// Initial DOM: text split as "Ab" + "out"
const initialDom = [
  {
    childCount: 2,
    className: 'TableCell',
    type: 11,
  },
  {
    childCount: 1,
    className: 'SearchHighlight',
    type: 8,
  },
  {
    childCount: 0,
    text: 'Ab',
    type: 12,
  },
  {
    childCount: 0,
    text: 'out',
    type: 12,
  },
]

// Updated DOM: text split as "Abo" + "ut"
const updatedDom = [
  {
    childCount: 2,
    className: 'TableCell',
    type: 11,
  },
  {
    childCount: 1,
    className: 'SearchHighlight',
    type: 8,
  },
  {
    childCount: 0,
    text: 'Abo',
    type: 12,
  },
  {
    childCount: 0,
    text: 'ut',
    type: 12,
  },
]

renderInto($container, initialDom)

const patches = diffTree(initialDom, updatedDom)
const $root = $container.firstElementChild
applyPatch($root, patches)

window.__virtualDomDiffTestComplete = true
