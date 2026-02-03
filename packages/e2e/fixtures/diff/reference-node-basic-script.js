import {
  renderInto,
  applyPatch,
  VirtualDomElements,
  setViewletInstance,
} from '/dist/virtual-dom/dist/index.js'
import { diffTree } from '/dist/virtual-dom-worker/dist/index.js'

const $container = document.getElementById('diff-container')

// Mock viewlet instance for reference node
const mockViewletInstance = {
  state: {
    $Viewlet: document.createElement('span'),
  },
}

// Set up the reference node with a UID
const referenceNodeUid = 'ref-uid-1'
mockViewletInstance.state.$Viewlet.textContent = 'Referenced Component'
setViewletInstance(referenceNodeUid, mockViewletInstance)

const initialDom = [
  {
    type: VirtualDomElements.Div,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Reference,
    uid: referenceNodeUid,
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
    type: VirtualDomElements.Reference,
    uid: referenceNodeUid,
    childCount: 0,
  },
]

const patches = diffTree(initialDom, updatedDom)
const $root = $container.firstElementChild
applyPatch($root, patches)

window.__virtualDomDiffTestComplete = true
