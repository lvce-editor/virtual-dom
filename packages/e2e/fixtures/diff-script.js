import {
  renderInto,
  applyPatch,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'
import { diff } from '/dist/virtual-dom-worker/dist/index.js'

const $container = document.getElementById('diff-container')

// Initial virtual dom
const initialDom = [
  {
    type: VirtualDomElements.Div,
    className: 'initial-class',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Initial Text',
    childCount: 0,
  },
]

// Render initial DOM
renderInto($container, initialDom)

// Updated virtual dom
const updatedDom = [
  {
    type: VirtualDomElements.Div,
    className: 'updated-class',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Updated Text',
    childCount: 0,
  },
]

// Calculate diff
const patches = diff(initialDom, updatedDom)

// Apply patches
const $root = $container.firstElementChild
applyPatch($root, patches)

window.__virtualDomDiffTestComplete = true
