import { renderInto, applyPatch } from '/dist/virtual-dom/dist/index.js'
import { diff } from '/dist/virtual-dom-worker/dist/index.js'
import { VirtualDomElements } from '/dist/virtual-dom-worker/dist/index.js'

const $container = document.getElementById('diff-container')

// Initial virtual dom
const initialDom = [
  {
    type: VirtualDomElements.Div,
    text: 'Initial Text',
    className: 'initial-class',
    childCount: 0,
  },
]

// Render initial DOM
renderInto($container, initialDom)

// Updated virtual dom
const updatedDom = [
  {
    type: VirtualDomElements.Div,
    text: 'Updated Text',
    className: 'updated-class',
    childCount: 0,
  },
]

// Calculate diff
const patches = diff(initialDom, updatedDom)

// Apply patches
const $root = $container.firstElementChild
applyPatch($root, patches)

window.__virtualDomDiffTestComplete = true
