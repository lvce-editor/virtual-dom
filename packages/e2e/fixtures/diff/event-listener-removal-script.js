import {
  renderInto,
  applyPatch,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'
import { diffTree } from '/dist/virtual-dom-worker/dist/index.js'

const $container = document.getElementById('diff-container')
let clickCount = 0

const eventMap = {
  1: () => {
    clickCount += 1
  },
}

const initialDom = [
  {
    type: VirtualDomElements.Div,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Button,
    id: 'removed-listener-button',
    onClick: 1,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Click',
    childCount: 0,
  },
]

renderInto($container, initialDom, eventMap)

const updatedDom = [
  {
    type: VirtualDomElements.Div,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Button,
    id: 'removed-listener-button',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Click',
    childCount: 0,
  },
]

const patches = diffTree(initialDom, updatedDom)
const $root = $container.firstElementChild
applyPatch($root, patches, eventMap)

window.__virtualDomListenerRemovalClickCount = () => clickCount
window.__virtualDomDiffTestComplete = true
