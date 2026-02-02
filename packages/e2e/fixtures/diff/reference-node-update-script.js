import {
  renderInto,
  applyPatch,
  VirtualDomElements,
  setViewletInstance,
} from '/dist/virtual-dom/dist/index.js'
import { diffTree } from '/dist/virtual-dom-worker/dist/index.js'

const $container = document.getElementById('diff-container')

// Create two different reference node instances
const refUid1 = 'ref-uid-1'
const refUid2 = 'ref-uid-2'

const $ref1 = document.createElement('span')
$ref1.textContent = 'Component 1'
setViewletInstance(refUid1, { state: { $Viewlet: $ref1 } })

const $ref2 = document.createElement('span')
$ref2.textContent = 'Component 2'
setViewletInstance(refUid2, { state: { $Viewlet: $ref2 } })

const initialDom = [
  {
    type: VirtualDomElements.Div,
    id: 'container',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Reference,
    uid: refUid1,
    childCount: 0,
  },
]

renderInto($container, initialDom)

// Update to reference a different component
const updatedDom = [
  {
    type: VirtualDomElements.Div,
    id: 'container',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Reference,
    uid: refUid2,
    childCount: 0,
  },
]

const patches = diffTree(initialDom, updatedDom)
const $root = $container.firstElementChild
applyPatch($root, patches)

window.__virtualDomDiffTestComplete = true
