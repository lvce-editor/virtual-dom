import {
  renderInto,
  applyPatch,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'
import { diff } from '/dist/virtual-dom-worker/dist/index.js'

const $container = document.getElementById('diff-container')

const initialDom = [
  {
    type: VirtualDomElements.Text,
    text: 'Initial Text',
    childCount: 0,
  },
]

renderInto($container, initialDom)

const updatedDom = [
  {
    type: VirtualDomElements.Text,
    text: 'Updated Text',
    childCount: 0,
  },
]

const patches = diff(initialDom, updatedDom)
const $root = $container.firstChild
applyPatch($root, patches)

window.__virtualDomDiffTestComplete = true
