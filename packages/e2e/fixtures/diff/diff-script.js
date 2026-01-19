import {
  renderInto,
  applyPatch,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'
import { diff } from '/dist/virtual-dom-worker/dist/index.js'

const $container = document.getElementById('diff-container')

// Initial virtual dom - just a div with text
const initialDom = [
  {
    type: VirtualDomElements.Div,
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

// Updated virtual dom - same structure, just different text
const updatedDom = [
  {
    type: VirtualDomElements.Div,
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

// Apply patches - start from the root div element
const $root = $container.firstElementChild
applyPatch($root, patches)

window.__virtualDomDiffTestComplete = true
