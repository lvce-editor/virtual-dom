import {
  renderInto,
  applyPatch,
  VirtualDomElements,
  setViewletInstance,
} from '/dist/virtual-dom/dist/index.js'
import { diffTree } from '/dist/virtual-dom-worker/dist/index.js'

const $container = document.getElementById('diff-container')

// Create reference node instances
const refUid1 = 'ref-nested-1'
const refUid2 = 'ref-nested-2'

const $ref1 = document.createElement('span')
$ref1.className = 'ref-component'
$ref1.textContent = 'Inner Component'
setViewletInstance(refUid1, { state: { $Viewlet: $ref1 } })

const $ref2 = document.createElement('span')
$ref2.className = 'ref-component'
$ref2.textContent = 'Footer Component'
setViewletInstance(refUid2, { state: { $Viewlet: $ref2 } })

// Initial DOM structure with nested elements and reference nodes
const initialDom = [
  {
    type: VirtualDomElements.Div,
    className: 'wrapper',
    childCount: 3,
  },
  {
    type: VirtualDomElements.Header,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Header Content',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Section,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Reference,
    uid: refUid1,
    childCount: 0,
  },
  {
    type: VirtualDomElements.Footer,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Footer Text',
    childCount: 0,
  },
]

renderInto($container, initialDom)

// Update structure: change text and add another reference node
const updatedDom = [
  {
    type: VirtualDomElements.Div,
    className: 'wrapper',
    childCount: 3,
  },
  {
    type: VirtualDomElements.Header,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Updated Header',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Section,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Reference,
    uid: refUid1,
    childCount: 0,
  },
  {
    type: VirtualDomElements.Footer,
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
