import {
  renderInto,
  applyPatch,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'
import { diffTree } from '/dist/virtual-dom-worker/dist/index.js'

const $container = document.getElementById('diff-container')
let count = 0

const updateText = () => {
  const $button = $container.querySelector('button')
  if ($button) {
    $button.textContent = String(count)
  }
}

const eventMap = {
  1: () => {
    count += 1
    updateText()
  },
  2: () => {
    count += 2
    updateText()
  },
}

const initialDom = [
  {
    type: VirtualDomElements.Div,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Button,
    onClick: 1,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: '0',
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
    onClick: 2,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: '0',
    childCount: 0,
  },
]

const patches = diffTree(initialDom, updatedDom)
const $root = $container.firstElementChild
applyPatch($root, patches, eventMap)

window.__virtualDomDiffTestComplete = true
